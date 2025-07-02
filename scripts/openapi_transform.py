#! /usr/bin/env python3

import json
import sys
from typing import Any, Dict, List, Union

OPENAPI_VERSION = "3.0.3"


def update_content_type(schema: Dict[str, Any]) -> Dict[str, Any]:
    """Updates the content type from form-urlencoded to JSON in the OpenAPI schema.

    This function searches for request bodies with the `application/x-www-form-urlencoded`
    content type and replaces it with `application/json`.

    Args:
        schema: The OpenAPI schema as a dictionary.

    Returns:
        The updated OpenAPI schema with modified content types.
    """
    if not isinstance(schema, dict):
        return schema

    new_schema = schema.copy()

    # Check if this is a path object with operations
    if "paths" in new_schema:
        for path in new_schema["paths"].values():
            for operation in path.values():
                if isinstance(operation, dict) and "requestBody" in operation:
                    request_body = operation["requestBody"]
                    if "content" in request_body:
                        # Replace form-urlencoded with JSON if it exists
                        if (
                            "application/x-www-form-urlencoded"
                            in request_body["content"]
                        ):
                            content_schema = request_body["content"][
                                "application/x-www-form-urlencoded"
                            ]
                            del request_body["content"][
                                "application/x-www-form-urlencoded"
                            ]
                            request_body["content"]["application/json"] = content_schema

    return new_schema


def update_nullable_fields(
    schema: Union[Dict[str, Any], List[Any]]
) -> Union[Dict[str, Any], List[Any]]:
    """Updates fields to be nullable based on 'anyOf' constructs in the OpenAPI schema.

    This function traverses the OpenAPI schema and converts fields that use `anyOf` with
    `null` into fields with the `nullable` attribute set to `True`.

    Args:
        schema: The OpenAPI schema as a dictionary or list.

    Returns:
        The updated OpenAPI schema with nullable fields.
    """
    if not isinstance(schema, (dict, list)):
        return schema

    if isinstance(schema, list):
        return [update_nullable_fields(item) for item in schema]

    # Handle dictionary
    new_schema = {}

    for key, value in schema.items():
        if key == "anyOf":
            # Check if one of the anyOf types is null
            types = [item.get("type") for item in value]
            if "null" in types:
                # Find the non-null type and create new schema with nullable
                non_null_type = next(
                    item for item in value if item.get("type") != "null"
                )
                new_schema.update(update_nullable_fields(non_null_type))
                new_schema["nullable"] = True
            else:
                # If no null type, keep anyOf as is
                new_schema[key] = [update_nullable_fields(item) for item in value]
        else:
            new_schema[key] = update_nullable_fields(value)

    return new_schema


def update_openapi_version(schema: Dict[str, Any], version: str) -> Dict[str, Any]:
    """Updates the OpenAPI version in the schema.

    Args:
        schema: The OpenAPI schema as a dictionary.
        version: The OpenAPI version to set.

    Returns:
        The updated OpenAPI schema with the new version.
    """
    schema["openapi"] = version
    return schema


def process_openapi_file(input_path: str) -> None:
    """Processes the OpenAPI file and writes the transformed JSON to stdout.

    This function reads an OpenAPI JSON file, applies transformations to update
    nullable fields, change content types from form-urlencoded to JSON, and set
    the OpenAPI version. The updated schema is then written to stdout.

    Args:
        input_path: Path to the input OpenAPI JSON file.
    """
    with open(input_path, "r", encoding="utf-8") as file:
        spec = json.load(file)

    # Update OpenAPI version
    spec = update_openapi_version(spec, OPENAPI_VERSION)

    # Apply both transformations
    spec = update_nullable_fields(spec)
    spec = update_content_type(spec)

    # Write to stdout with proper indentation
    json.dump(spec, sys.stdout, indent=2)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python openapi_transform.py <input_file>", file=sys.stderr)
        sys.exit(1)

    input_file = sys.argv[1]
    process_openapi_file(input_file)
