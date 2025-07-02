import asyncio
import time
from mcp.server.fastmcp import FastMCP
from src.client.models import (
    Token,
    Body_login_api_auth_tokens_post,
    BoardInCreate,
    BoardInUpdate,
    BoardOut,
    CardInCreate,
    CardInUpdate,
    CardOut,
)
from src.client.services.async_auth_service import login_api_auth_tokens_post
from src.client.services.async_boards_service import (
    list_boards_api_boards_get,
    get_board_api_boards__board_id__get,
    list_cards_api_boards__board_id__cards_get,
    create_board_api_boards_post,
    update_board_api_boards__board_id__patch,
    delete_board_api_boards__board_id__delete,
    create_cards_api_boards__board_id__cards_post,
)
from src.client.services.async_cards_service import (
    get_card_api_cards__card_id__get,
    update_card_api_cards__card_id__patch,
    delete_card_api_cards__card_id__delete,
)
from src.client.api_config import APIConfig
from src.config import config
import json
import os

mcp = FastMCP()


async def get_api_config() -> APIConfig:
    api_config = APIConfig(base_path=config.api_base_url)

    # or token older than 1 hour
    if (
        not os.path.exists(config.token_path)
        or time.time() - os.path.getmtime(config.token_path) > 3600
    ):

        response = await login_api_auth_tokens_post(
            data=Body_login_api_auth_tokens_post(
                grant_type="password",
                username=config.mcp_username,
                password=config.mcp_password,
            ),
            api_config_override=api_config,
        )
        with open(config.token_path, "w") as file:
            json.dump(response.model_dump(), file)

    with open(config.token_path, "r") as file:
        token = json.load(file)

    api_config.set_access_token(token["access_token"])
    return api_config


@mcp.tool()
async def list_boards():
    """Get list of all boards."""
    api_config = await get_api_config()
    response: list[BoardOut] = await list_boards_api_boards_get(
        api_config_override=api_config
    )
    return [
        board.model_dump(include={"id", "name", "created_at", "updated_at"})
        for board in response
    ]


@mcp.tool()
async def get_board(board_id: int, include_cards: bool = True):
    """Get a board and its cards by ID."""
    api_config = await get_api_config()
    board_out: BoardOut = await get_board_api_boards__board_id__get(
        board_id=board_id,
        api_config_override=api_config,
    )

    if include_cards:
        cards_out: list[CardOut] = await list_cards_api_boards__board_id__cards_get(
            board_id=board_id,
            api_config_override=api_config,
        )
        return {
            "board": board_out,
            "cards": [
                card.model_dump(
                    include={"id", "name", "label", "created_at", "updated_at"}
                )
                for card in cards_out
            ],
        }

    return board_out.model_dump()


@mcp.tool()
async def create_board(board_in_create: BoardInCreate):
    """Create a new board."""
    api_config = await get_api_config()
    response: BoardOut = await create_board_api_boards_post(
        data=BoardInCreate(
            title=board_in_create.title,
            description=board_in_create.description or "",
        ),
        api_config_override=api_config,
    )
    return response.model_dump(include={"id"})


@mcp.tool()
async def update_board(board_id: int, board_in_update: BoardInUpdate):
    """Update a board by its ID."""
    api_config = await get_api_config()
    response: BoardOut = await update_board_api_boards__board_id__patch(
        board_id=board_id,
        data=board_in_update,
        api_config_override=api_config,
    )
    return response.model_dump(include={"id", "created_at", "updated_at"})


@mcp.tool()
async def delete_board(board_id: int):
    """Delete a board by its ID."""
    api_config = await get_api_config()
    await delete_board_api_boards__board_id__delete(
        board_id=board_id,
        api_config_override=api_config,
    )


@mcp.tool()
async def create_cards(board_id: int, cards_in_create: list[CardInCreate]):
    """Create a new card in the specified board."""
    api_config = await get_api_config()
    response: list[CardOut] = await create_cards_api_boards__board_id__cards_post(
        board_id=board_id,
        data=cards_in_create,
        api_config_override=api_config,
    )
    return [
        card.model_dump(include={"id", "created_at", "updated_at"}) for card in response
    ]


@mcp.tool()
async def get_cards(card_ids: list[int]):
    """Get a card by its ID."""
    api_config = await get_api_config()
    responses: list[CardOut] = await asyncio.gather(
        *(
            get_card_api_cards__card_id__get(
                card_id=card_id,
                api_config_override=api_config,
            )
            for card_id in card_ids
        )
    )
    return responses


@mcp.tool()
async def update_cards(card_id: int, cards_in_update: list[CardInUpdate]):
    """Update a card by its ID."""
    api_config = await get_api_config()
    responses: list[CardOut] = await asyncio.gather(
        *(
            update_card_api_cards__card_id__patch(
                card_id=card_id,
                data=card_in_update,
                api_config_override=api_config,
            )
            for card_in_update in cards_in_update
        )
    )
    return [
        card.model_dump(include={"id", "created_at", "updated_at"})
        for card in responses
    ]


@mcp.tool()
async def delete_cards(card_ids: list[int]):
    """Delete a card by its ID."""
    api_config = await get_api_config()
    await asyncio.gather(
        *(
            delete_card_api_cards__card_id__delete(
                card_id=card_id, api_config_override=api_config
            )
            for card_id in card_ids
        )
    )


if __name__ == "__main__":
    mcp.run()
