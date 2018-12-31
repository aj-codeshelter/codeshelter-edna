import { user } from '../../test_util'
import {
  createTestUser, deleteTestUser, logIn, makeTestUserPremium, setTestUserResetKey, setTestUserVerifyKey,
  seed
} from '../scripts/_util'

describe('the auth page', () => {
  describe('the login form', () => {
    before(() => {
      cy.visit('/auth.html#/login')
    })

    beforeEach(() => {
      cy.get('div.username > input').as('username')
      cy.get('div.password > input').as('password')
      cy.get('button').contains('Log In').as('logIn')
    })

    it('has a login form', () => {
      cy.get('@username').should('be.visible')
      cy.get('@password').should('be.visible')
      cy.get('div.captcha iframe').should('be.visible')
      cy.get('@logIn').should('be.visible')
    })

    it('has a sign up link', () => {
      cy.get('button').contains('Sign up')
    })

    it('has a demo link', () => {
      cy.get('button').contains('demo')
    })
  })

  describe('post-login', () => {
    beforeEach(() => {
      cy.visit('/auth.html#/login')
      
      cy.get('div.username > input').as('username')
      cy.get('div.password > input').as('password')
      cy.get('button').contains('Log In').as('logIn')
    })

    it('allows logging in', () => {
      seed(cy, () => {
        deleteTestUser(cy)
        createTestUser(cy)
      })

      cy.get('@username').type(user.email)
      cy.get('@password').type(user.password)
      cy.get('@logIn').click()
      cy.url().should('contain', '#/limited')
      cy.getCookie('connect.sid').should('exist')
      cy.get('button').contains('Continue').click()
      cy.url().should('contain', '/app')
    })

    it('allows logging in (premium)', () => {
      seed(cy, () => {
        deleteTestUser()
        createTestUser()
        makeTestUserPremium()
      })

      cy.get('@username').type(user.email)
      cy.get('@password').type(user.password)
      cy.get('@logIn').click()
      cy.url().should('contain', '/app')
      cy.getCookie('connect.sid').should('exist')
    })
  })

  describe('the signup page', () => {
    function signUp() {
      cy.get('@username').type(user.email)
      cy.get('@password').type(user.password)
      cy.get('@signUp').click()
      cy.url().should('contain', '/verification')      
    }

    beforeEach(() => {
      cy.visit('/auth.html#/login')
      cy.get('button').contains('Sign up').click()
      cy.get('div.username input').as('username')
      cy.get('div.password input').as('password')
      cy.get('button').contains('Create').as('signUp')
    })

    it('has a signup form', () => {
      cy.get('@username').should('be.visible')
      cy.get('@password').should('be.visible')
      cy.get('div.captcha iframe').should('be.visible')
      cy.get('@signUp').should('be.visible')
    })

    it('allows signing up', () => {
      seed(cy, () => {
        deleteTestUser()
      })
      signUp()
      cy.getCookie('connect.sid').should('exist')
    })

    it(`doesn't allow unverified users to visit the app`, () => {
      seed(cy, () => {
        deleteTestUser()
      })
      signUp()
      cy.contains('Log out').click()
      cy.url().should('contain', '/login')
      cy.get('@username').type(user.email)
      cy.get('@password').type(user.password)
      cy.get('button').contains('Log In').click()
      cy.url().should('contain', '/verification')
      cy.visit('/app.html#/compose')
      cy.url().should('contain', '/verification')
    })

    it('allows verifying your account', () => {
      seed(cy, () => {
        deleteTestUser()
      })
      signUp()
      seed(cy, () => {
        setTestUserVerifyKey()
      })
      cy.visit(`/auth.html#/verify/${encodeURIComponent(user.email)}/${user.verifyKey}`)
      cy.url().should('contain', '/limited')
    })
  })

  describe('the password reset process', () => {
    beforeEach(() => {
      seed(cy, () => {
        deleteTestUser(cy)
        createTestUser(cy)
      })
      cy.visit('/auth.html#/login')
    })

    it('allows you to request a password reset link', () => {
      cy.get('button.forgot-button').click()
      cy.url().should('contain', '/forgot')
      cy.get('input.email-input').type(user.email)
      cy.get('button.reset-button').click()
      cy.get('.success').should('exist')
    })

    it('allows you to reset your password', () => {
      seed(cy, () => {
        setTestUserResetKey(cy)
      })
      cy.visit(`/auth.html#/reset/${encodeURIComponent(user.email)}/${user.resetKey}`)
      cy.get('.message').should('exist')

      const newPassword = `${user.password}-updated`
      cy.get('input.password-input').type(newPassword)
      cy.get('button.submit-button').click()
      cy.get('.success').should('exist')
      cy.get('button.finish-button').click()
      cy.url().should('contain', '/app')
      
      cy.visit('/auth.html#/login')
      cy.get('div.username > input').type(user.email)
      cy.get('div.password > input').type(newPassword)
      cy.get('button').contains('Log In').click()
      cy.url().should('contain', '/limited')
    })
  })
  
  describe('deleting an account', () => {
    beforeEach(() => {
      seed(cy, () => {
        deleteTestUser(cy)
        createTestUser(cy)
      })
      logIn(cy, user.email, user.password)
      cy.visit('/auth.html#/account')
    })

    it('allows deleting an account with the correct password', () => {
      cy.get('div.delete').find('button').click()
      cy.url().should('contain', '/delete-account')
      cy.get('.password-input').type(user.password)
      cy.get('button').contains('Delete').click()
      cy.url().should('contain', '/login')
    })

    it(`doesn't allow deleting an account with the wrong password`, () => {
      cy.get('div.delete').find('button').click()
      cy.url().should('contain', '/delete-account')
      cy.get('.password-input').type('NOT THE CORRECT PASSWORD')
      cy.get('button').contains('Delete').click()
      cy.get('.error').should('be.visible')
      cy.url().should('contain', '/delete-account')
    })
  })
})
