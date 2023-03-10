# IAM Team- Final Assignment I

## Description
Identity & Access Management system stands at the entrance to an a/b tests system.
Account is a group of one or more users, which contains one account manager (a user with privileges).
Accounts and users have the life cycle of: none → active → suspended → closed.

#### We provide internal authentication service as a proxy for other teams. The service will support:
* Authentication and authorization.
* Account and user profile.
* Registration, login, forgot password and actions on users (suspension, edit details and more).
* The service is using Google API to allow login in with gmail.
* Users sessions and permission are managed by JWT.
* Admin can view business statistics from internal services.
* Account manager can invite or add another user to his account through inivitation link that sent to email.

## Flow
1.  Login or registration.
    registration will demend authentication by email with verification code.
    After registration you will be asked to log in.
2.  Information and features will be displayed according to user type:
    * admin- internal system permissions: CRUD on all users and accounts in the system, and their properties. Admin pages: 
      - Users - all users 
      - Accounts - all accounts
      - My Profile - rw
      - Dashboard - statistics
    * manager- account permissions: CRUD on all properties (and users) of account. Manager pages:
      - My Account - rw
      - My Profile - rw
    * user- user permissions: CRUD only on it own properties. User pages:
      - My Account - r
      - My Profile - rw

## FYIs:
* Passwords and codes sent to email can end up in the spam folder.
* Api requests that contain body in postman should be formatted as JSON.
* Admin users do not have accounts by definition.
* Account name will be define by the user's email that created it.
* To make tests using Postman you first **must** perform a login through our API (below) in order to receive the cookies.
* Log in with Shenkar email makes you admin automatically. 

## Prerequisites
```bash
  Node.js 16v
```
## Run with render
```bash
  type in url browser: https://abtest-shenkar.onrender.com/login
```
## Local run - not recommended
```bash
git clone hhttps://github.com/Iam-Shenkar/IAM_Final.git
```
### Install
```bash
npm install
```
### Start server
```bash
npm start
```
### Start client
```bash
type in url borwser: http://localhost:5000 
```
### Other dependancies
```bash
create .env file with secrets that will pass by demand 
```
## API documantion
```bash
https://documenter.getpostman.com/view/24057770/2s8Z6u4ETe
```
## Built with
* nodejs
* RabbitMq
* express
* mongoose
* Google API
* javascript
* html
* css

## Credits
* Roey Ben Harush :ring:
* Racheli Dekel :roll_eyes:
* Shahar Ariel :guitar:
* Tomer Duchovni 	:soccer:
* Roni Naor :socks:
* Ofir Peleg :tomato:

## Lecturer
David Avigad :lollipop:
