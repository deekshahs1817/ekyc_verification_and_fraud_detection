from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[UserRole] = UserRole.USER


class UserLogin(BaseModel):
    email: str  # can be email or username
    password: str


class GoogleLoginRequest(BaseModel):
    credential: str


class CompleteProfilePayload(BaseModel):
    full_name: str
    dob: str
    gender: str
    house_number: str
    street: str
    city: str
    state: str
    pincode: str
    occupation: str
    annual_income: str


class UserResponse(BaseModel):
    id: str
    name: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: UserRole
    google_id: Optional[str] = None
    profile_picture: Optional[str] = None
    auth_provider: str = "EMAIL"
    profile_completed: bool = False
    is_profile_complete: bool = False
    dob: Optional[str] = None
    gender: Optional[str] = None
    house_number: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    address: Optional[str] = None
    occupation: Optional[str] = None
    annual_income: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    profile_completed: bool = False


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None
