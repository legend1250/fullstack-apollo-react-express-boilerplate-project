import LandingPage from '../Landing';
import AccountPage from '../Account';
import AdminPage from '../Admin';

export const routesComp = [
  {
    exact: true,
    path: '/admin',
    component: AdminPage,
    roles: ['admin']
  },
  {
    exact: true,
    path: '/account',
    component: AccountPage,
    roles: ['admin', 'user']
  },
  {
    exact: true,
    path: '/',
    component: LandingPage,
    roles: ['admin', 'user']
  },
]

export const routesMenu = [
  {
    title: 'Admin',
    path: '/admin',
    roles: ['admin'],
    icon: 'star',
    breadcumbs: ['Administration']
  },
  {
    title: 'My account',
    roles: ['admin', 'user'],
    icon: 'user',
    subComponent: [
      {
        title: 'Information',
        path: '/account',
        icon: 'idcard',
        breadcumbs: ['Account', 'Account information']
      }
    ]
  },
  {
    title: 'Events',
    path: '/',
    roles: ['admin', 'user'],
    icon: 'file',
    breadcumbs: ['Events']
  },
]