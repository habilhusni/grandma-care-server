# grandma-care-server

Access Website through http://ec2-35-157-203-118.eu-central-1.compute.amazonaws.com/
---
### Usage
npm install
npm start
---

### List of Basic Route
| Route | Methods | Description |
| --- | --- | --- |
| /users | GET | Get all users data |
| /users/:userId | GET | Get one user data |
| /signup | POST | Signup new user |
| /login | POST | Login existing user |
| /users/:userId | PUT | Update data user |
| /users/:userId/:friendId | PUT | User add new friend |
| /users/:userId/location/:latitude/:longitude | PUT | User update location |
| /users/:userId | DELETE | Delete user data |
| /users/:userId/:friendId | DELETE | User remove friend |
