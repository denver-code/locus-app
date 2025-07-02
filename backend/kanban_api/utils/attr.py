def update_attributes(model, update_dict):
    for field, value in update_dict.items():
        setattr(model, field, value)
