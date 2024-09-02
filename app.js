const express = require('express')
const app = express()
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const path = require('path')
app.use(express.json())
let db = null
const dbPath = path.join(__dirname, 'cricketTeam.db')
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server is running at 3000 port')
    })
  } catch (e) {
    console.log('DB Error:' + e.message)
    process.exit(1)
  }
}
const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}
initializeDBAndServer()

//List of all players(get)//
app.get('/players/', async (request, response) => {
  const query = 'select * from cricket_team order by player_id;'
  let playerArray = await db.all(query)
  response.send(
    playerArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})
//creating a new player in db//

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const addQuery = `
    INSERT INTO
      cricket_team (player_name,jersey_number,role)
    VALUES
      (
        '${playerName}',
         ${jerseyNumber},
         '${role}'
      );`

  let addedPlayer = await db.run(addQuery)
  response.send('Player Added to Team')
})
//getting specific player from the team//
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const gettingplayer =
    'select * from cricket_team where player_id =' + playerId + ';'
  let a = []
  const player = await db.get(gettingplayer)
  a.push(player)
  response.send(
    a.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer))[0],
  )
})
//UPDATING PLAYER DETAILS//
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName, jerseyNumber, role} = request.body
  const updatePlayerQuery = `
    UPDATE cricket_team
    SET player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
    WHERE player_id = '${playerId}';
  `
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})
//DELETING PLAYER//
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const removingplayer =
    'delete from cricket_team where player_id =' + playerId + ';'
  await db.run(removingplayer)
  response.send('Player Removed')
})
module.exports = app
