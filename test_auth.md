# Test Authentication Endpoints

## 1. Test Login dengan User Default
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@deepos.com",
    "password": "password"
  }'
```

## 2. Test Register User Baru
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@deepos.com",
    "password": "password123",
    "role": "cashier"
  }'
```

## 3. Test Login dengan User Baru
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@deepos.com",
    "password": "password123"
  }'
```

## Default User untuk Testing:
- **Email**: admin@deepos.com
- **Password**: password
- **Role**: admin

## Response Format:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "name": "Admin User",
      "email": "admin@deepos.com",
      "role": "admin",
      "isActive": true
    },
    "token": "jwt_token_here"
  }
}
```