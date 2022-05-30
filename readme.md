# Travel Experiences

A simple backend project with Express by [Emilio Hernando](https://github.com/eha78) and [Manoel Castro](https://github.com/manoelcl)
This project allows to manage advices and recommendations for travel experiences

## Instructions

  - Clone or download the repository
  - Use npm install to get it working
  - Use Postman or another client to make requests, request examples are [included](https://github.com/manoelcl/TravelExperiences/blob/master/references/TravelExperiences.postman_collection.json)


## 1. Database structure

### ER Diagram

![screenshot](https://github.com/manoelcl/TravelExperiences/blob/master/references/ER_Diagram.svg)

### User
    - id
    - username *
    - password *
    - email *
    - role *
    - creation date
    - registration code

### Recommendation
    - id
    - title *
    - class *
    - location *
    - abstract *
    - content *
    - photo *
    - creation_date

### Vote
    - user_id *
    - recommendation_id *
    - score *
    - creation_date

### Comment
    - id
    - content *
    - recommendation_id *
    - user_id *
    - creation_date

## Requirements

## 2. Endpoints

### PUBLIC (authentication not required)

### - GET /recommendations
- Get a list of recommendations filtered and ordered by the following query params
- Query params: 

      - location: filter by location 
      - class: filter by class 
      - orderByVotes: order by average rating
      
- Return: a list of recommendations following the query params

### - GET /recommendations/:idRecommendation

- Get the whole recommendation by id

- Path params: 

      - idEntry: el id del artículo
      
- Return: the whole recommendation identified with the path param

### - POST /users/login

- User login

- Body: 

      - username 
      - password
      
- Return: JWT for the authenticated user

### - POST /users

- Create new user

- Body: 

      - email 
      - password 
      - username 
      - role
      
- Return: confirmation user registered

### PRIVATE (authentication required)

### - POST /recommendations

- Create a recommendation

- Body:

      - title 
      - class 
      - location 
      - abstract 
      - content 
      - photo
      
- Return: url and confirmation

### - POST /recommendations/:idRecommendation/vote
- Vote for a recommendation
- Query params: 
      
      - rating
- Return: confirmation of the vote

### - POST /recommendations/:idRecommendation/comment
- Write a comment for a recommendation
- Body: 

      - content
- Return: confirmation

### - DELETE /recommendations/:idRecommendation
