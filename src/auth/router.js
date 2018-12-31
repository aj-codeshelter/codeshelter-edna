import Vue from 'vue'
import Router from 'vue-router'
import authApi from './authApi'

import DeleteAccount from './deleteAccount.page.vue'
import Forgot from './forgot.page.vue'
import Login from './login.page.vue'
import Reset from './reset.page.vue'
import Signup from './signup.page.vue'
import Success from './success.page.vue'
import Verification from './verification.page.vue'
import Verify from './verify.page.vue'

Vue.use(Router)

let currentUser = null
const getCurrentUser = () => currentUser

// Use this route guard to ensure the user is logged in.
const assertLoggedIn = (to, from, next) => {
  authApi.getUser().then((user) => {
    currentUser = user
    next()
  }, (err) => {
    console.error(err)
    next({ path: '/login' })
  })
}

// Use this route guard to ensure the user's email address is verified.
const assertVerified = (to, from, next) => {
  authApi.getUser().then((user) => {
    currentUser = user
    if (user.verified === false) {
      return next({ path: '/verification' })
    }
    next()
  }, (err) => {
    console.error(err)
    next({ path: '/login' })
  })
}

// Use this route guard to ensure the user's email address is *not* verified.
const assertUnverified = (to, from, next) => {
  authApi.getUser().then((user) => {
    currentUser = user
    if (user.verified === true) {
      return next({ path: '/account' })
    }
    next()
  }, (err) => {
    console.error(err)
    next({ path: '/login' })
  })
}

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'Log In',
      component: Login,
    },
    {
      path: '/account',
      name: 'Account',
      component: () => import('./account.page.vue' /* webpackChunkName: "account-page" */),
      beforeEnter: assertLoggedIn,
      meta: { getCurrentUser },
    },
    {
      path: '/delete-account',
      name: 'Delete Your Account',
      component: DeleteAccount,
      beforeEnter: assertLoggedIn,
    },
    {
      path: '/forgot',
      name: 'Forgot Password',
      component: Forgot,
    },
    {
      path: '/reset/:email/:key',
      name: 'Reset Password',
      component: Reset,
    },
    {
      path: '/signup',
      name: 'Sign Up',
      component: Signup,
    },
    {
      path: '/verification',
      name: 'Verify Account',
      component: Verification,
      beforeEnter: assertUnverified,
      meta: { getCurrentUser },
    },
    {
      path: '/verify/:email/:key',
      name: 'Verify Link',
      component: Verify,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
})
