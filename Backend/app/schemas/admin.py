from pydantic import BaseModel


class DashboardCard(BaseModel):
    label: str
    value: str


class DashboardResponse(BaseModel):
    cards: list[DashboardCard]


class AnalyticsMetric(BaseModel):
    label: str
    value: str


class CustomerSummary(BaseModel):
    id: int
    name: str
    email: str
    orders: int
    spent: int
    status: str


class UpdateOrderStatusPayload(BaseModel):
    status: str

