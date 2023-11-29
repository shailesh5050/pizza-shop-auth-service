import {calculateDiscount} from './src/uttils'
import app from './src/app'
import request from 'supertest'
describe("App",()=>{
    it("should work",()=>{
        const result = calculateDiscount(100,10)
        expect(result).toBe(10)
    })

    it("should return 200 status",async ()=>{
        
        const response = await request(app).get("/").send()
        expect(response.status).toBe(200)

    })
})