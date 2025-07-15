# runeGard backend

## Backend Tech Stack

- **Framework:** FastAPI
- **Database:** MongoDB
- **Authentication:** Clerk Backend API (Python SDK)
- **ODM:** pymongo (async MongoDB driver)
- **Validation:** Pydantic
- **Containerization:** Docker



## API Endpoints Overview

### Users
- `POST /init` — Initialize user profile
- `GET /me` — Get current user's profile
- `DELETE /me` — Delete current user and all associated data
- `PUT /update` — Update user profile
- `GET /{user_id}` — Get public user profile
- `GET /{user_id}/projects` — Get user's projects
- `GET /{user_id}/stats` — Get user statistics
- `GET /` — Search users with filters

### Projects
- `POST /` — Create a new project
- `GET /` — Get projects with filters and pagination
- `GET /trending` — Get trending projects
- `GET /{project_id}` — Get a specific project by ID
- `PUT /{project_id}` — Update a project (only by owner)
- `DELETE /{project_id}` — Delete a project (only by owner)
- `POST /{project_id}/upvote` — Upvote/toggle upvote for a project
- `POST /{project_id}/contributors/{contributor_id}` — Add contributor to project

### Teammate Requests
- `POST /` — Create a new teammate request
- `GET /` — Get teammate requests with optional filters
- `GET /my` — Get current user's teammate requests
- `GET /recent` — Get recent teammate requests
- `GET /by-tags` — Get teammate requests by specific tags
- `GET /project/{project_id}` — Get teammate requests for a specific project
- `GET /{request_id}` — Get a specific teammate request by ID
- `PUT /{request_id}` — Update a teammate request (only by owner)
- `DELETE /{request_id}` — Delete a teammate request (only by owner)

### Testimonials
- `POST /` — Create a new testimonial
- `GET /users/{user_id}` — Get testimonials for a specific user
- `GET /check-exists` — Check if current user has already left a testimonial for target user
- `GET /{testimonial_id}` — Get a specific testimonial by ID
- `PUT /{testimonial_id}` — Update a testimonial (only by author)
- `DELETE /{testimonial_id}` — Delete a testimonial (only by author)



## Schema Overview

### User
- `user_id`: str
- `name`: str
- `email`: str
- `bio`: Optional[str]
- `skills`: List[str]
- `institute`: str
- `grad_year`: int
- `created_at`: datetime

### Project
- `id`: str
- `title`: str
- `abstract`: str
- `tech_stack`: List[str]
- `github_link`: str
- `demo_link`: Optional[str]
- `report_url`: Optional[str]
- `contributors`: List[str]
- `tags`: List[str]
- `status`: str (open/completed)
- `created_by`: str
- `upvotes`: int
- `featured`: bool
- `created_at`: datetime

### Teammate Request
- `id`: str
- `user_id`: str
- `looking_for`: str
- `description`: str
- `project_id`: Optional[str]
- `tags`: List[str]
- `created_at`: datetime

### Testimonial
- `id`: str
- `from_user`: str
- `to_user`: str
- `content`: str
- `created_at`: datetime


## Pagination & Filtering
- Most list endpoints support pagination (`page`, `limit`) and filtering (e.g., `tags`, `tech_stack`, `search`).

## Error & Response Models
- Standardized success/error responses using Pydantic models.