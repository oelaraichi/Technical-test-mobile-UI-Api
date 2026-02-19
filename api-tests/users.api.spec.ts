import axios from 'axios'
import { expect } from 'chai'

const API_BASE_URL = process.env.API_BASE_URL || 'https://reqres.in'
const REQRES_API_KEY = process.env.REQRES_API_KEY?.trim()

const withApiKey = {
  headers: {
    'x-api-key': REQRES_API_KEY ?? '',
  },
}

describe('API - Users', function () {
  this.timeout(30000)

  it('GET /api/users should require x-api-key', async () => {
    try {
      await axios.get(`${API_BASE_URL}/api/users?page=2`)
      throw new Error('Expected 401 but request succeeded')
    } catch (error: any) {
      const status = error.response?.status
      expect([401, 403]).to.include(status)

      // 401: Reqres JSON auth error. 403: Cloudflare block page in some environments.
      if (status === 401) {
        expect(error.response?.data).to.be.an('object')
        expect(error.response?.data).to.include.keys('error', 'message')
        expect(String(error.response?.data?.error || '')).to.match(/missing_api_key|invalid_key/i)
      }
    }
  })

  describe('Legacy users with valid key', function () {
    before(function () {
      if (!REQRES_API_KEY) this.skip()
    })

    it('GET /api/users?page=2 should fetch legacy users', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/users?page=2`, withApiKey)

      expect(response.status).to.equal(200)
      expect(response.data).to.be.an('object')
      expect(response.data).to.include.keys('page', 'per_page', 'total', 'data')
      expect(response.data.page).to.equal(2)
      expect(response.data.data).to.be.an('array').that.is.not.empty
      expect(response.data.data[0]).to.include.keys('id', 'email', 'first_name', 'last_name', 'avatar')
    })

    it('POST /api/users should create a legacy user', async () => {
      const payload = {
        name: 'QA Manager',
        job: 'automation lead',
      }

      const response = await axios.post(`${API_BASE_URL}/api/users`, payload, withApiKey)

      expect(response.status).to.equal(201)
      expect(response.data).to.be.an('object')
      expect(response.data).to.include({
        name: payload.name,
        job: payload.job,
      })
      expect(response.data).to.have.property('id')
      expect(response.data).to.have.property('createdAt')
    })
  })
})
