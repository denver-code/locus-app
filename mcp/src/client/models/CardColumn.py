from enum import Enum


class CardColumn(str, Enum):

    BACKLOG = "BACKLOG"
    TODO = "TODO"
    DOING = "DOING"
    DONE = "DONE"
