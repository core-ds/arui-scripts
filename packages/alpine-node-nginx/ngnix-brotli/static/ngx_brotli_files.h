/*
 * Copyright (C) Igor Sysoev
 * Copyright (C) Nginx, Inc.
 * Copyright (C) Google Inc.
 * Copyright (C) Aleksandr Kitov
 */

#ifndef NGX_BROTLI_FILES_H
#define NGX_BROTLI_FILES_H

#include <ngx_core.h>
#include <ngx_http.h>

ngx_int_t validate_dcb_file_sign(ngx_http_request_t* req, ngx_str_t* path,
                                        ngx_str_t* expected_hash);

ngx_int_t serve_static_file(ngx_http_request_t* req, ngx_str_t* path,
                                   const char* encoding, size_t encoding_len);

ngx_int_t serve_dcb_file(ngx_http_request_t* req, ngx_str_t* original_path,
                                ngx_str_t* file_prefix, ngx_str_t* cache_id);

#endif //NGX_BROTLI_FILES_H
