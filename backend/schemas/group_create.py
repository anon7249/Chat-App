from pydantic import BaseModel

class GroupCreate(BaseModel):
  group_name:str
  members_id: list[int]
  
class  GroupMessageCreate(BaseModel):
  message: str
