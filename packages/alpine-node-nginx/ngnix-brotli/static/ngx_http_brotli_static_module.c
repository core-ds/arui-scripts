/*
 * Copyright (C) Igor Sysoev
 * Copyright (C) Nginx, Inc.
 * Copyright (C) Google Inc.
 * Copyright (C) Aleksandr Kitov
 */

#include <ngx_config.h>
#include <ngx_core.h>
#include <ngx_http.h>

#include "ngx_brotli_http_headers.h"
#include "ngx_brotli_files.h"

/* >> Configuration */

#define NGX_HTTP_BROTLI_STATIC_OFF 0
#define NGX_HTTP_BROTLI_STATIC_ON 1
#define NGX_HTTP_BROTLI_STATIC_ALWAYS 2

typedef struct {
  ngx_uint_t enable;
} configuration_t;

static ngx_conf_enum_t kBrotliStaticEnum[] = {
    {ngx_string("off"), NGX_HTTP_BROTLI_STATIC_OFF},
    {ngx_string("on"), NGX_HTTP_BROTLI_STATIC_ON},
    {ngx_string("always"), NGX_HTTP_BROTLI_STATIC_ALWAYS},
    {ngx_null_string, 0}};

/* << Configuration */

/* >> Forward declarations */

static ngx_int_t handler(ngx_http_request_t* req);
static void* create_conf(ngx_conf_t* root_cfg);
static char* merge_conf(ngx_conf_t* root_cfg, void* parent, void* child);
static ngx_int_t init(ngx_conf_t* root_cfg);

/* << Forward declarations*/

/* >> Module definition */

static ngx_command_t kCommands[] = {
    {ngx_string("brotli_static"),
     NGX_HTTP_MAIN_CONF | NGX_HTTP_SRV_CONF | NGX_HTTP_LOC_CONF |
         NGX_CONF_TAKE1,
     ngx_conf_set_enum_slot, NGX_HTTP_LOC_CONF_OFFSET,
     offsetof(configuration_t, enable), &kBrotliStaticEnum},
    ngx_null_command};

static ngx_http_module_t kModuleContext = {
    NULL, /* preconfiguration */
    init, /* postconfiguration */

    NULL, /* create main configuration */
    NULL, /* init main configuration */

    NULL, /* create server configuration */
    NULL, /* merge server configuration */

    create_conf, /* create location configuration */
    merge_conf   /* merge location configuration */
};

ngx_module_t ngx_http_brotli_static_module = {
    NGX_MODULE_V1,
    &kModuleContext, /* module context */
    kCommands,       /* module directives */
    NGX_HTTP_MODULE, /* module type */
    NULL,            /* init master */
    NULL,            /* init module */
    NULL,            /* init process */
    NULL,            /* init thread */
    NULL,            /* exit thread */
    NULL,            /* exit process */
    NULL,            /* exit master */
    NGX_MODULE_V1_PADDING};

/* << Module definition*/

static /* const */ char kEncoding[] = "br";
static const size_t kEncodingLen = 2;
static /* const */ u_char kSuffix[] = ".br";
static const size_t kSuffixLen = 3;


/* Test if this request is allowed to have the brotli response. */
static ngx_int_t check_eligibility(ngx_http_request_t* req) {
  if (req != req->main) return NGX_DECLINED;
  if (check_br_accept_encoding(req) != NGX_OK) return NGX_DECLINED;
  req->gzip_tested = 1;
  req->gzip_ok = 0;
  return NGX_OK;
}

static ngx_int_t handler(ngx_http_request_t* req) {
  configuration_t* cfg;
  ngx_int_t rc;
  u_char* last;
  ngx_str_t path;
  size_t root;
  ngx_str_t file_prefix;
  ngx_str_t cache_id;

  /* Only GET and HEAD requensts are supported. */
  if (!(req->method & (NGX_HTTP_GET | NGX_HTTP_HEAD))) return NGX_DECLINED;

  /* Only files are supported. */
  if (req->uri.data[req->uri.len - 1] == '/') return NGX_DECLINED;

  /* Get configuration and check if module is disabled. */
  cfg = ngx_http_get_module_loc_conf(req, ngx_http_brotli_static_module);
  if (cfg->enable == NGX_HTTP_BROTLI_STATIC_OFF) return NGX_DECLINED;

  if (cfg->enable == NGX_HTTP_BROTLI_STATIC_ALWAYS) {
    /* Ignore request properties (e.g. Accept-Encoding). */
  } else {
    /* NGX_HTTP_BROTLI_STATIC_ON */
    req->gzip_vary = 1;
    rc = check_eligibility(req);
    if (rc != NGX_OK) return NGX_DECLINED;
  }

  /* Check if DCB is in accept-encoding and dictionary-id is present */
  if (check_dcb_accept_encoding(req) == NGX_OK &&
        parse_dictionary_id(req, &file_prefix, &cache_id) == NGX_OK) {

    /* Get path for the original file (without .br suffix) */
    last = ngx_http_map_uri_to_path(req, &path, &root, kSuffixLen);
    if (last == NULL) return NGX_HTTP_INTERNAL_SERVER_ERROR;
    /* +1 for reinstating the terminating 0. */
    ngx_cpystrn(last, kSuffix, kSuffixLen + 1);
    path.len += kSuffixLen;

    /* Try to serve the DCB file */
    rc = serve_dcb_file(req, &path, &file_prefix, &cache_id);
    if (rc != NGX_DECLINED) {
      return rc;
    }
    /* If we get here, either DCB is not supported/requested or the DCB file was not found */
    /* Fall back to serving the .br file as before */
    ngx_log_debug0(NGX_LOG_DEBUG_HTTP, req->connection->log, 0,
                   "Failed to serve dcb file to supporting browser");
  }

  /* Get path and append the suffix. */
  last = ngx_http_map_uri_to_path(req, &path, &root, kSuffixLen);
  if (last == NULL) return NGX_HTTP_INTERNAL_SERVER_ERROR;
  /* +1 for reinstating the terminating 0. */
  ngx_cpystrn(last, kSuffix, kSuffixLen + 1);
  path.len += kSuffixLen;

  /* Use the common function to serve the file */
  return serve_static_file(req, &path, kEncoding, kEncodingLen);
}

static void* create_conf(ngx_conf_t* root_cfg) {
  configuration_t* cfg;
  cfg = ngx_palloc(root_cfg->pool, sizeof(configuration_t));
  if (cfg == NULL) return NULL;
  cfg->enable = NGX_CONF_UNSET_UINT;
  return cfg;
}

static char* merge_conf(ngx_conf_t* root_cfg, void* parent, void* child) {
  configuration_t* prev = parent;
  configuration_t* cfg = child;
  ngx_conf_merge_uint_value(cfg->enable, prev->enable,
                            NGX_HTTP_BROTLI_STATIC_OFF);
  return NGX_CONF_OK;
}

static ngx_int_t init(ngx_conf_t* root_cfg) {
  ngx_http_core_main_conf_t* core_cfg;
  ngx_http_handler_pt* handler_slot;
  core_cfg = ngx_http_conf_get_module_main_conf(root_cfg, ngx_http_core_module);
  handler_slot =
      ngx_array_push(&core_cfg->phases[NGX_HTTP_CONTENT_PHASE].handlers);
  if (handler_slot == NULL) return NGX_ERROR;
  *handler_slot = handler;
  return NGX_OK;
}
