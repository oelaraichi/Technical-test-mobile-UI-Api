import axios from 'axios'
import { expect } from 'chai'

const API_BASE_URL = process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com'

describe('API - Users', function () {
  this.timeout(30000)

  it('GET /users/1 should fetch a user', async () => {
    const response = await axios.get(`${API_BASE_URL}/users/1`)

    expect(response.status).to.equal(200)
    expect(response.data).to.be.an('object')
    expect(response.data).to.include.keys('id', 'name', 'username', 'email')
    expect(response.data.id).to.equal(1)
  })

  it('POST /users should create a user', async () => {
    const payload = {
      name: 'QA Manager',
      username: 'qa.manager',
      email: 'qa.manager@example.com',
    }

    const response = await axios.post(`${API_BASE_URL}/users`, payload)

    expect(response.status).to.equal(201)
    expect(response.data).to.be.an('object')
    expect(response.data).to.include({
      name: payload.name,
      username: payload.username,
      email: payload.email,
    })
    expect(response.data).to.have.property('id')
  })
})

