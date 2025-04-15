/*
 * Copyright (C) Igor Sysoev
 * Copyright (C) Nginx, Inc.
 * Copyright (C) Google Inc.
 * Copyright (C) Aleksandr Kitov
 */

#ifndef NGX_BROTLI_UTILS_H
#define NGX_BROTLI_UTILS_H

#include <ngx_config.h>
#include <ngx_core.h>
#include <ngx_http.h>

// Finds the last occurrence of a character in a string
u_char* ngx_brotli_find_last_char(u_char* string, size_t length, u_char search_char);

// Finds the first occurrence of a character in a string
u_char* ngx_brotli_find_first_char(u_char* string, size_t length, u_char search_char);

// Finds a specific header in the HTTP request headers
ngx_table_elt_t* ngx_brotli_find_header(ngx_http_request_t* req, const char* header_name);

#endif /* NGX_BROTLI_UTILS_H */
