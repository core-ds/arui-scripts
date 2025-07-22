/*
 * Copyright (C) Igor Sysoev
 * Copyright (C) Nginx, Inc.
 * Copyright (C) Google Inc.
 * Copyright (C) Aleksandr Kitov
 */

#include <ngx_config.h>
#include <ngx_core.h>
#include <ngx_http.h>

/**
 * Finds the last occurrence of a character in a string
 * 
 * @param string The string to search in
 * @param length The length of the string
 * @param search_char The character to search for
 * @return Pointer to the last occurrence of the character, or NULL if not found
 */
u_char* ngx_brotli_find_last_char(u_char* string, size_t length, u_char search_char) {
    u_char* current_position = string + length - 1;
    while (current_position >= string) {
        if (*current_position == search_char) {
            return current_position;
        }
        current_position--;
    }
    return NULL;
}

/**
 * Finds the first occurrence of a character in a string
 * 
 * @param string The string to search in
 * @param length The length of the string
 * @param search_char The character to search for
 * @return Pointer to the first occurrence of the character, or NULL if not found
 */
u_char* ngx_brotli_find_first_char(u_char* string, size_t length, u_char search_char) {
    u_char* current_position = string;
    u_char* end_position = string + length;
    while (current_position < end_position) {
        if (*current_position == search_char) {
            return current_position;
        }
        current_position++;
    }
    return NULL;
}

/**
 * Finds a specific header in the HTTP request headers
 * 
 * @param req The HTTP request structure
 * @param header_name The name of the header to find (case-insensitive)
 * @return Pointer to the header entry if found, NULL otherwise
 */
ngx_table_elt_t* ngx_brotli_find_header(ngx_http_request_t* req, const char* header_name) {
    ngx_list_part_t* current_part;
    ngx_table_elt_t* header_element;
    ngx_str_t header_name_str;
    ngx_table_elt_t* found_header = NULL;

    /* Create a non-const string for comparison */
    header_name_str.data = (u_char*)header_name;
    header_name_str.len = ngx_strlen(header_name);

    /* Find the header in the headers list */
    current_part = &req->headers_in.headers.part;

    while (current_part) {
        header_element = current_part->elts;
        for (ngx_uint_t i = 0; i < current_part->nelts; i++) {
            if (header_element[i].key.len == header_name_str.len &&
                ngx_strncasecmp(header_element[i].key.data, header_name_str.data, header_name_str.len) == 0) {
                found_header = &header_element[i];
                break;
            }
        }

        if (found_header) {
            break;
        }

        current_part = current_part->next;
    }

    return found_header;
}
