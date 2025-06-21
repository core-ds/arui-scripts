/*
 * Copyright (C) Igor Sysoev
 * Copyright (C) Nginx, Inc.
 * Copyright (C) Google Inc.
 * Copyright (C) Aleksandr Kitov
 */

#ifndef NGX_BROTLI_HTTP_HEADERS_H
#define NGX_BROTLI_HTTP_HEADERS_H

#include <ngx_core.h>
#include <ngx_http.h>

ngx_int_t set_use_as_dictionary_header(ngx_http_request_t* req);

ngx_int_t check_br_accept_encoding(ngx_http_request_t* req);

ngx_int_t check_dcb_accept_encoding(ngx_http_request_t* req);

ngx_int_t parse_dictionary_id(ngx_http_request_t* req, ngx_str_t* file_prefix,
                                     ngx_str_t* cache_id);

ngx_int_t check_available_dictionary(ngx_http_request_t* req, ngx_str_t* expected_hash);

#endif //NGX_BROTLI_HTTP_HEADERS_H
