/*
 * Copyright (C) Igor Sysoev
 * Copyright (C) Nginx, Inc.
 * Copyright (C) Google Inc.
 * Copyright (C) Aleksandr Kitov
 */

#include <ngx_core.h>
#include <ngx_http.h>

#include "ngx_brotli_utils.h"

/* Constants for header names and values */
static const u_char kUseAsDictionary[] = "Use-As-Dictionary";

static /* const */ char kEncoding[] = "br";
static const size_t kEncodingLen = 2;

static /* const */ char kDcbEncoding[] = "dcb";
static const size_t kDcbEncodingLen = 3;

/**
 * Sets the Use-As-Dictionary header in the HTTP response.
 *
 * This function constructs a dictionary header value based on the request URI
 * and any forwarded prefix information. The header follows the format:
 * match="[prefix]/[pathname]/[basename].*.[ext]",id="[basename].[fileId]"
 *
 * @param req The HTTP request object
 * @return NGX_OK on success, NGX_ERROR on memory allocation failure
 */
ngx_int_t set_use_as_dictionary_header(ngx_http_request_t* req) {
  ngx_str_t uri = req->uri;
  ngx_str_t filename;
  ngx_str_t pathname;
  ngx_str_t basename;
  ngx_str_t ext;
  ngx_str_t fileId;
  ngx_table_elt_t* header;
  u_char* dot;
  u_char* second_dot;
  u_char* last_slash;
  u_char* header_value;
  size_t header_len;
  ngx_str_t forwarded_prefix;
  ngx_str_t prefix_to_use;
  u_char* comma_pos;
  u_char* prefix_start;
  u_char* prefix_end;

  // Initialize forwarded_prefix
  forwarded_prefix.data = NULL;
  forwarded_prefix.len = 0;

  // Check for x-forwarded-prefix header
  ngx_table_elt_t* prefix_header = ngx_brotli_find_header(req, "x-forwarded-prefix");
  if (prefix_header) {
    forwarded_prefix = prefix_header->value;
  }

  // Process forwarded_prefix if present
  if (forwarded_prefix.data) {
    // Find the last comma if present
    comma_pos = ngx_brotli_find_last_char(forwarded_prefix.data, forwarded_prefix.len, ',');
    if (comma_pos) {
      // Use the last part after the comma
      prefix_start = comma_pos + 1;
      // Skip leading whitespace
      while (prefix_start < forwarded_prefix.data + forwarded_prefix.len &&
             (*prefix_start == ' ' || *prefix_start == '\t')) {
        prefix_start++;
      }
      prefix_to_use.data = prefix_start;
      prefix_to_use.len = forwarded_prefix.data + forwarded_prefix.len - prefix_start;
    } else {
      // No comma, use the entire value
      prefix_to_use = forwarded_prefix;
    }

    // Skip trailing whitespace
    prefix_end = prefix_to_use.data + prefix_to_use.len - 1;
    while (prefix_end >= prefix_to_use.data &&
           (*prefix_end == ' ' || *prefix_end == '\t')) {
      prefix_end--;
      prefix_to_use.len--;
    }
  } else {
    // No x-forwarded-prefix header
    prefix_to_use.data = NULL;
    prefix_to_use.len = 0;
  }

  // Skip the leading slash
  if (uri.data[0] == '/') {
    uri.data++;
    uri.len--;
  }

  // Find the last slash to separate pathname and filename
  last_slash = ngx_brotli_find_last_char(uri.data, uri.len, '/');
  if (last_slash) {
    pathname.data = uri.data;
    pathname.len = last_slash - uri.data;
    filename.data = last_slash + 1;
    filename.len = uri.data + uri.len - filename.data;
  } else {
    pathname.data = NULL;
    pathname.len = 0;
    filename.data = uri.data;
    filename.len = uri.len;
  }

  // Check if filename matches the pattern *.*.*
  dot = ngx_brotli_find_first_char(filename.data, filename.len, '.');
  if (!dot) return NGX_OK;

  second_dot = ngx_brotli_find_first_char(dot + 1, filename.data + filename.len - (dot + 1), '.');
  if (!second_dot) return NGX_OK;

  // Extract basename, ext, and fileId
  basename.data = filename.data;
  basename.len = dot - filename.data;

  ext.data = second_dot + 1;
  ext.len = filename.data + filename.len - ext.data;

  fileId.data = dot + 1;
  fileId.len = second_dot - fileId.data;

  // Calculate header value length
  header_len = 7; // "match=\""
  header_len += prefix_to_use.len; // Add length of forwarded prefix
  header_len += 1; // "/"
  header_len += pathname.len;
  header_len += 1; // "/"
  header_len += basename.len;
  header_len += 3; // ".*."
  header_len += ext.len;
  header_len += 6; // "\",id=\""
  header_len += basename.len;
  header_len += 1; // "."
  header_len += fileId.len;
  header_len += 1; // "\""

  // Allocate memory for header value
  header_value = ngx_palloc(req->pool, header_len);
  if (!header_value) return NGX_ERROR;

  // Format header value using ngx_snprintf
  ngx_snprintf(header_value, header_len,
              "match=\"%V/%V/%V.*.%V\",id=\"%V.%V\"",
              &prefix_to_use,
              &pathname,
              &basename,
              &ext,
              &basename,
              &fileId);

  // Create and set the header
  header = ngx_list_push(&req->headers_out.headers);
  if (!header) return NGX_ERROR;

  header->hash = 1;
  ngx_str_set(&header->key, kUseAsDictionary);
  header->value.data = header_value;
  header->value.len = header_len;

  return NGX_OK;
}

/**
 * Checks if the request accepts Brotli encoding.
 *
 * This function examines the Accept-Encoding header to determine if the client
 * accepts Brotli compression (indicated by "br" in the header).
 *
 * @param req The HTTP request object
 * @return NGX_OK if Brotli is accepted, NGX_DECLINED otherwise
 */
ngx_int_t check_br_accept_encoding(ngx_http_request_t* req) {
  ngx_table_elt_t* accept_encoding_entry;
  ngx_str_t* accept_encoding;
  u_char* cursor;
  u_char* end;
  u_char before;
  u_char after;

  accept_encoding_entry = req->headers_in.accept_encoding;
  if (accept_encoding_entry == NULL) return NGX_DECLINED;
  accept_encoding = &accept_encoding_entry->value;

  cursor = accept_encoding->data;
  end = cursor + accept_encoding->len;
  while (1) {
    u_char digit;
    /* It would be an idiotic idea to rely on compiler to produce performant
       binary, that is why we just do -1 at every call site. */
    cursor = ngx_strcasestrn(cursor, kEncoding, kEncodingLen - 1);
    if (cursor == NULL) return NGX_DECLINED;
    before = (cursor == accept_encoding->data) ? ' ' : cursor[-1];
    cursor += kEncodingLen;
    after = (cursor >= end) ? ' ' : *cursor;
    if (before != ',' && before != ' ') continue;
    if (after != ',' && after != ' ' && after != ';') continue;

    /* Check for ";q=0[.[0[0[0]]]]" */
    while (*cursor == ' ') cursor++;
    if (*(cursor++) != ';') break;
    while (*cursor == ' ') cursor++;
    if (*(cursor++) != 'q') break;
    while (*cursor == ' ') cursor++;
    if (*(cursor++) != '=') break;
    while (*cursor == ' ') cursor++;
    if (*(cursor++) != '0') break;
    if (*(cursor++) != '.') return NGX_DECLINED; /* ;q=0, */
    digit = *(cursor++);
    if (digit < '0' || digit > '9') return NGX_DECLINED; /* ;q=0., */
    if (digit > '0') break;
    digit = *(cursor++);
    if (digit < '0' || digit > '9') return NGX_DECLINED; /* ;q=0.0, */
    if (digit > '0') break;
    digit = *(cursor++);
    if (digit < '0' || digit > '9') return NGX_DECLINED; /* ;q=0.00, */
    if (digit > '0') break;
    return NGX_DECLINED; /* ;q=0.000 */
  }
  return NGX_OK;
}

/**
 * Checks if the request accepts DCB encoding.
 *
 * This function examines the Accept-Encoding header to determine if the client
 * accepts DCB compression (indicated by "dcb" in the header).
 *
 * @param req The HTTP request object
 * @return NGX_OK if DCB is accepted, NGX_DECLINED otherwise
 */
ngx_int_t check_dcb_accept_encoding(ngx_http_request_t* req) {
  ngx_table_elt_t* accept_encoding_entry;
  ngx_str_t* accept_encoding;
  u_char* cursor;

  accept_encoding_entry = req->headers_in.accept_encoding;
  if (accept_encoding_entry == NULL) return NGX_DECLINED;
  accept_encoding = &accept_encoding_entry->value;

  /* Simply check if "dcb" is present in the Accept-Encoding header */
  cursor = ngx_strcasestrn(accept_encoding->data, kDcbEncoding, kDcbEncodingLen - 1);
  if (cursor == NULL) return NGX_DECLINED;

  ngx_log_debug0(NGX_LOG_DEBUG_HTTP, req->connection->log, 0,
                 "dcb is present in accept-encoding");

  return NGX_OK;
}

/**
 * Parses the dictionary-id header and extracts file_prefix and cache_id.
 *
 * This function extracts the file prefix and cache ID from a dictionary-id header
 * that follows the format "file_prefix.cache_id".
 *
 * @param req The HTTP request object
 * @param file_prefix Output parameter to store the file prefix
 * @param cache_id Output parameter to store the cache ID
 * @return NGX_OK on success, NGX_DECLINED if header is not found or malformed
 */
ngx_int_t parse_dictionary_id(ngx_http_request_t* req, ngx_str_t* file_prefix,
                                     ngx_str_t* cache_id) {
  ngx_table_elt_t* dictionary_id_entry;
  ngx_str_t* dictionary_id;
  u_char* dot;
  u_char* start;
  u_char* end;

  /* Find the dictionary-id header in the headers list */
  dictionary_id_entry = ngx_brotli_find_header(req, "dictionary-id");
  if (dictionary_id_entry == NULL) return NGX_DECLINED;
  dictionary_id = &dictionary_id_entry->value;

  /* Handle quoted values */
  start = dictionary_id->data;
  end = dictionary_id->data + dictionary_id->len;

  /* Skip leading whitespace */
  while (start < end && (*start == ' ' || *start == '\t')) {
    start++;
  }

  /* Check if the value is quoted */
  if (start < end && *start == '"') {
    start++; /* Skip the opening quote */

    /* Find the closing quote */
    while (start < end && *(end-1) == '"') {
      end--;
    }
  }

  /* Skip trailing whitespace */
  while (start < end && (*(end-1) == ' ' || *(end-1) == '\t')) {
    end--;
  }

  /* Find the dot separator within the trimmed value */
  dot = ngx_brotli_find_first_char(start, end - start, '.');
  if (dot == NULL) return NGX_DECLINED;

  /* Set file_prefix to the part before the dot */
  file_prefix->data = start;
  file_prefix->len = dot - start;

  /* Set cache_id to the part after the dot */
  cache_id->data = dot + 1;
  cache_id->len = end - cache_id->data;

  return NGX_OK;
}

/**
 * Checks if the request has the available-dictionary header with the expected hash.
 *
 * This function extracts the hash value from an available-dictionary header
 * that follows the format ":hash:" where hash is a base-64 encoded SHA-256 hash.
 *
 * @param req The HTTP request object
 * @param expected_hash Output parameter to store the extracted hash
 * @return NGX_OK on success, NGX_DECLINED if header is not found or malformed
 */
ngx_int_t check_available_dictionary(ngx_http_request_t* req, ngx_str_t* expected_hash) {
  ngx_table_elt_t* available_dict_entry;
  ngx_str_t* available_dict;
  u_char* start;
  u_char* end;
  u_char* colon_start;
  u_char* colon_end;
  ngx_str_t hash_str;

  /* Find the available-dictionary header in the headers list */
  available_dict_entry = ngx_brotli_find_header(req, "available-dictionary");
  if (available_dict_entry == NULL) {
    ngx_log_debug0(NGX_LOG_DEBUG_HTTP, req->connection->log, 0,
                   "available-dictionary header not found");
    return NGX_DECLINED;
  }

  available_dict = &available_dict_entry->value;

  /* Handle quoted values */
  start = available_dict->data;
  end = available_dict->data + available_dict->len;

  /* Skip leading whitespace */
  while (start < end && (*start == ' ' || *start == '\t')) {
    start++;
  }

  /* Check if the value is quoted */
  if (start < end && *start == '"') {
    start++; /* Skip the opening quote */

    /* Find the closing quote */
    while (start < end && *(end-1) == '"') {
      end--;
    }
  }

  /* Skip trailing whitespace */
  while (start < end && (*(end-1) == ' ' || *(end-1) == '\t')) {
    end--;
  }

  /* Find the colon-surrounded base-64 encoded SHA-256 hash */
  colon_start = ngx_brotli_find_first_char(start, end - start, ':');
  if (colon_start == NULL) {
    ngx_log_debug0(NGX_LOG_DEBUG_HTTP, req->connection->log, 0,
                   "available-dictionary header does not contain colon");
    return NGX_DECLINED;
  }

  colon_end = ngx_brotli_find_first_char(colon_start + 1, end - (colon_start + 1), ':');
  if (colon_end == NULL) {
    ngx_log_debug0(NGX_LOG_DEBUG_HTTP, req->connection->log, 0,
                   "available-dictionary header does not contain second colon");
    return NGX_DECLINED;
  }

  /* Extract the hash value */
  hash_str.data = colon_start + 1;
  hash_str.len = colon_end - hash_str.data;

  /* Set the expected hash */
  expected_hash->data = hash_str.data;
  expected_hash->len = hash_str.len;

  ngx_log_debug1(NGX_LOG_DEBUG_HTTP, req->connection->log, 0,
                 "available-dictionary hash: %V", expected_hash);

  return NGX_OK;
}
