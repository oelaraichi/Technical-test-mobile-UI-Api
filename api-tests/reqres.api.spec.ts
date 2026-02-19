import axios from 'axios'
import { expect } from 'chai'

const API_BASE_URL = process.env.API_BASE_URL || 'https://reqres.in'
const REQRES_API_KEY = process.env.REQRES_API_KEY?.trim()
const hasApiKey = Boolean(REQRES_API_KEY)

const headers: Record<string, string> = {
  'content-type': 'application/json',
}

if (REQRES_API_KEY) {
  headers['x-api-key'] = REQRES_API_KEY
}

describe('Reqres Legacy API', function () {
  this.timeout(30000)

  it('GET /api/users/2 should fetch a user', async () => {
    const response = await axios.get(`${API_BASE_URL}/api/users/2`, {
      headers,
      validateStatus: () => true,
    })

    if (hasApiKey) {
      expect(response.status).to.equal(200)
      expect(response.data).to.be.an('object')
      expect(response.data).to.have.property('data')
      expect(response.data.data).to.be.an('object')
      expect(response.data.data.id).to.equal(2)
      expect(response.data.data).to.include.keys('email', 'first_name', 'last_name', 'avatar')
      return
    }

    expect([401, 403]).to.include(response.status)
  })

  it('POST /api/users should create a user', async () => {
    const payload = {
      name: 'QA Manager',
      job: 'automation lead',
    }

    const response = await axios.post(`${API_BASE_URL}/api/users`, payload, {
      headers,
      validateStatus: () => true,
    })

    if (hasApiKey) {
      expect(response.status).to.equal(201)
      expect(response.data).to.be.an('object')
      expect(response.data).to.include({
        name: payload.name,
        job: payload.job,
      })
      expect(response.data).to.have.property('id')
      expect(response.data).to.have.property('createdAt')
      return
    }

    expect([401, 403]).to.include(response.status)
  })
})
