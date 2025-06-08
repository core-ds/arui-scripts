/*
 * Copyright (C) Igor Sysoev
 * Copyright (C) Nginx, Inc.
 * Copyright (C) Google Inc.
 * Copyright (C) Aleksandr Kitov
 */

#include <ngx_core.h>
#include <ngx_http.h>

#include "ngx_brotli_http_headers.h"
#include "ngx_brotli_utils.h"

static const u_char kContentEncoding[] = "Content-Encoding";

static /* const */ u_char kDcbSuffix[] = ".dcb";
static const size_t kDcbSuffixLen = 4;
static /* const */ char kDcbEncoding[] = "dcb";
static const size_t kDcbEncodingLen = 3;
static const size_t kSuffixLen = 3;

/**
 * Validates the signature in a DCB file by comparing the stored hash with the expected hash
 *
 * @param req The HTTP request object
 * @param path Path to the DCB file to validate
 * @param expected_hash The expected hash value to compare against
 * @return NGX_OK if validation succeeds, NGX_DECLINED otherwise
 */
ngx_int_t validate_dcb_file_sign(ngx_http_request_t* req, ngx_str_t* path,
                                        ngx_str_t* expected_hash) {
  ngx_file_t file;
  ngx_int_t rc;
  u_char hash_buffer[32]; /* SHA-256 hash is 32 bytes */
  u_char header_buffer[4]; /* 4 header bytes to skip */
  ngx_str_t actual_hash;
  ngx_str_t decoded_hash;

  /* Open the file */
  ngx_memzero(&file, sizeof(ngx_file_t));
  file.name = *path;
  file.log = req->connection->log;

  file.fd = ngx_open_file(path->data, NGX_FILE_RDONLY, NGX_FILE_OPEN, 0);

  /* Check that dcb file actually present */
  if (file.fd == NGX_INVALID_FILE) {
    ngx_log_debug1(NGX_LOG_DEBUG_HTTP, req->connection->log, 0,
                   "failed to open file \"%s\" for hash validation", path->data);
    return NGX_DECLINED;
  }

  /* Read the 4 header bytes to skip */
  rc = ngx_read_file(&file, header_buffer, 4, 0);
  if (rc != 4) {
    ngx_log_debug1(NGX_LOG_DEBUG_HTTP, req->connection->log, 0,
                  "failed to read header bytes from \"%s\"", path->data);
    ngx_close_file(file.fd);
    return NGX_DECLINED;
  }

  /* Read the SHA-256 hash (32 bytes) */
  rc = ngx_read_file(&file, hash_buffer, 32, 4);
  if (rc != 32) {
    ngx_log_debug1(NGX_LOG_DEBUG_HTTP, req->connection->log, 0,
                   "failed to read hash from \"%s\"", path->data);
    ngx_close_file(file.fd);
    return NGX_DECLINED;
  }

  /* Close the file */
  ngx_close_file(file.fd);

  /* Create a string for the actual hash */
  actual_hash.data = hash_buffer;
  actual_hash.len = 32;

  /* Create a string for the decoded hash */
  decoded_hash.data = ngx_palloc(req->pool, expected_hash->len);
  ngx_decode_base64(&decoded_hash, expected_hash);

  /* Compare the hashes */
  if (decoded_hash.len != actual_hash.len ||
      ngx_memcmp(decoded_hash.data, actual_hash.data, actual_hash.len) != 0) {
    ngx_log_error(NGX_LOG_ERR, req->connection->log, ngx_errno,
                      "failed to validate signature for file \"%s\"", path->data);
    return NGX_DECLINED;
  }

  ngx_log_debug0(NGX_LOG_DEBUG_HTTP, req->connection->log, 0, "hash validation succeeded");
  return NGX_OK;
}

/**
 * Serves a static file with the specified encoding
 *
 * @param req The HTTP request object
 * @param path Path to the file to serve
 * @param encoding The content encoding to use (e.g., "br", "dcb")
 * @param encoding_len Length of the encoding string
 * @return NGX_OK if file is served successfully, error code otherwise
 */
ngx_int_t serve_static_file(ngx_http_request_t* req, ngx_str_t* path,
                                   const char* encoding, size_t encoding_len) {
  ngx_int_t rc;
  ngx_log_t* log;
  ngx_http_core_loc_conf_t* location_cfg;
  ngx_open_file_info_t file_info;
  ngx_table_elt_t* content_encoding_entry;
  ngx_buf_t* buf;
  ngx_chain_t out;
  ngx_str_t encoding_str;

  log = req->connection->log;
  ngx_log_debug1(NGX_LOG_DEBUG_HTTP, log, 0, "http filename: \"%s\"",
                 path->data);

  /* Prepare to read the file. */
  location_cfg = ngx_http_get_module_loc_conf(req, ngx_http_core_module);
  ngx_memzero(&file_info, sizeof(ngx_open_file_info_t));
  file_info.read_ahead = location_cfg->read_ahead;
  file_info.directio = location_cfg->directio;
  file_info.valid = location_cfg->open_file_cache_valid;
  file_info.min_uses = location_cfg->open_file_cache_min_uses;
  file_info.errors = location_cfg->open_file_cache_errors;
  file_info.events = location_cfg->open_file_cache_events;
  rc = ngx_http_set_disable_symlinks(req, location_cfg, path, &file_info);
  if (rc != NGX_OK) return NGX_HTTP_INTERNAL_SERVER_ERROR;

  /* Try to fetch file and process errors. */
  rc = ngx_open_cached_file(location_cfg->open_file_cache, path, &file_info,
                            req->pool);
  if (rc != NGX_OK) {
    ngx_uint_t level;
    switch (file_info.err) {
      case 0:
        return NGX_HTTP_INTERNAL_SERVER_ERROR;

      case NGX_ENOENT:
      case NGX_ENOTDIR:
      case NGX_ENAMETOOLONG:
        return NGX_DECLINED;

#if (NGX_HAVE_OPENAT)
      case NGX_EMLINK:
      case NGX_ELOOP:
#endif
      case NGX_EACCES:
        level = NGX_LOG_ERR;
        break;

      default:
        level = NGX_LOG_CRIT;
        break;
    }
    ngx_log_error(level, log, file_info.err, "%s \"%s\" failed",
                  file_info.failed, path->data);
    return NGX_DECLINED;
  }

  /* So far so good. */
  ngx_log_debug1(NGX_LOG_DEBUG_HTTP, log, 0, "http static fd: %d",
                 file_info.fd);

  /* Only files are supported. */
  if (file_info.is_dir) {
    ngx_log_debug0(NGX_LOG_DEBUG_HTTP, log, 0, "http dir");
    return NGX_DECLINED;
  }
#if !(NGX_WIN32)
  if (!file_info.is_file) {
    ngx_log_error(NGX_LOG_CRIT, log, 0, "\"%s\" is not a regular file",
                  path->data);
    return NGX_HTTP_NOT_FOUND;
  }
#endif

  /* Prepare request push the body. */
  req->root_tested = !req->error_page;
  rc = ngx_http_discard_request_body(req);
  if (rc != NGX_OK) return rc;
  log->action = "sending response to client";
  req->headers_out.status = NGX_HTTP_OK;
  req->headers_out.content_length_n = file_info.size;
  req->headers_out.last_modified_time = file_info.mtime;
  rc = ngx_http_set_etag(req);
  if (rc != NGX_OK) return NGX_HTTP_INTERNAL_SERVER_ERROR;
  rc = ngx_http_set_content_type(req);
  if (rc != NGX_OK) return NGX_HTTP_INTERNAL_SERVER_ERROR;

  /* Set "Content-Encoding" header. */
  content_encoding_entry = ngx_list_push(&req->headers_out.headers);
  if (content_encoding_entry == NULL) return NGX_HTTP_INTERNAL_SERVER_ERROR;
  content_encoding_entry->hash = 1;
#if nginx_version >= 1023000
  content_encoding_entry->next = NULL;
#endif
  ngx_str_set(&content_encoding_entry->key, kContentEncoding);

  /* Create a proper ngx_str_t for the encoding value */
  encoding_str.data = (u_char*)encoding;
  encoding_str.len = encoding_len;
  content_encoding_entry->value = encoding_str;

  req->headers_out.content_encoding = content_encoding_entry;

  /* Set "Use-As-Dictionary" header if applicable */
  rc = set_use_as_dictionary_header(req);
  if (rc != NGX_OK) return NGX_HTTP_INTERNAL_SERVER_ERROR;

  /* Setup response body. */
  buf = ngx_pcalloc(req->pool, sizeof(ngx_buf_t));
  if (buf == NULL) return NGX_HTTP_INTERNAL_SERVER_ERROR;
  buf->file = ngx_pcalloc(req->pool, sizeof(ngx_file_t));
  if (buf->file == NULL) return NGX_HTTP_INTERNAL_SERVER_ERROR;
  buf->file_pos = 0;
  buf->file_last = file_info.size;
  buf->in_file = buf->file_last ? 1 : 0;
  buf->last_buf = (req == req->main) ? 1 : 0;
  buf->last_in_chain = 1;
  buf->file->fd = file_info.fd;
  buf->file->name = *path;
  buf->file->log = log;
  buf->file->directio = file_info.is_directio;
  out.buf = buf;
  out.next = NULL;

  /* Push the response header. */
  rc = ngx_http_send_header(req);
  if (rc == NGX_ERROR || rc > NGX_OK || req->header_only) {
    return rc;
  }

  /* Push the response body. */
  return ngx_http_output_filter(req, &out);
}

/**
 * Serves a DCB file if it exists and validates its signature
 *
 * @param req The HTTP request object
 * @param original_path The original path of the requested file
 * @param file_prefix Prefix to check in the filename
 * @param cache_id Cache identifier to append to the filename
 * @return NGX_OK if file is served successfully, NGX_DECLINED otherwise
 */
ngx_int_t serve_dcb_file(ngx_http_request_t* req, ngx_str_t* original_path,
                                ngx_str_t* file_prefix, ngx_str_t* cache_id) {
  u_char* last;
  ngx_str_t path;
  size_t root;
  ngx_str_t filename;
  u_char* last_slash;
  u_char* p;
  ngx_str_t expected_hash;
  ngx_int_t rc;

  /* Check for available-dictionary header */
  rc = check_available_dictionary(req, &expected_hash);
  if (rc != NGX_OK) {
    ngx_log_debug0(NGX_LOG_DEBUG_HTTP, req->connection->log, 0,
                   "available-dictionary header not found or invalid");
    return NGX_DECLINED;
  }

  /* Get the original path without the .br suffix */
  path = *original_path;
  path.len -= kSuffixLen;

  /* Find the last slash to separate pathname and filename */
  last_slash = ngx_brotli_find_last_char(path.data, path.len, '/');
  if (last_slash) {
    filename.data = last_slash + 1;
    filename.len = path.data + path.len - filename.data;
  } else {
    filename.data = path.data;
    filename.len = path.len;
  }

  /* Check if filename starts with file_prefix */
  if (filename.len < file_prefix->len ||
      ngx_strncmp(filename.data, file_prefix->data, file_prefix->len) != 0) {
    return NGX_DECLINED;
  }

  /* Create the DCB file path */
  last = ngx_http_map_uri_to_path(req, &path, &root, kDcbSuffixLen + cache_id->len + 1);
  if (last == NULL) return NGX_HTTP_INTERNAL_SERVER_ERROR;

  /* Append the cache_id and .dcb suffix */
  p = last;
  p = ngx_cpymem(p, ".", 1);
  p = ngx_cpymem(p, cache_id->data, cache_id->len);
  p = ngx_cpymem(p, kDcbSuffix, kDcbSuffixLen);
  *p = '\0';
  path.len += cache_id->len + kDcbSuffixLen;

   /* Validate the SHA-256 hash in the DCB file */
   rc = validate_dcb_file_sign(req, &path, &expected_hash);
   if (rc != NGX_OK) {
     ngx_log_debug0(NGX_LOG_DEBUG_HTTP, req->connection->log, 0, "DCB file hash validation failed");
     return NGX_DECLINED;
   }

  /* Set Vary header with accept-encoding, available-dictionary values */
  ngx_table_elt_t* vary_header = ngx_list_push(&req->headers_out.headers);
  if (vary_header == NULL) {
    return NGX_HTTP_INTERNAL_SERVER_ERROR;
  }
  vary_header->hash = 1;
  ngx_str_set(&vary_header->key, "Vary");
  ngx_str_set(&vary_header->value, "accept-encoding, available-dictionary");

  /* Use the common function to serve the file */
  return serve_static_file(req, &path, kDcbEncoding, kDcbEncodingLen);
}
