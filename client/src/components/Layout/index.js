import React, { Component } from 'react'
import { client } from '../../'
import { Router, Route, Switch, Link } from 'react-router-dom';
import { Layout, Menu, Breadcrumb, Icon, Button } from 'antd';
import gql from 'graphql-tag';
import { routesComp, routesMenu } from './routes'
import { Page404 } from '../Error';
import { Query } from 'react-apollo';

const { Header, Content, Footer, Sider } = Layout;
const SubMenu = Menu.SubMenu;

const getSession = gql`
  query getSession @client{
    me {
      id
      username
      email
      role
    }
  }
`

class SiderDemo extends React.Component {
  state = {
    collapsed: false,
  };

  onCollapse = (collapsed) => {
    console.log(collapsed);
    this.setState({ collapsed });
  }

  getSession = () => {
    client.query({query: getSession}).then( result => {
      const { me } = result.data
      console.log('me: ',me);
    })
  }

  render() {
    return (
      <Query query={getSession} >
        {({ data }) => {
          const { me } = data

          return(
            <Layout style={{ minHeight: '100vh' }}>
              <Sider
                collapsible
                collapsed={this.state.collapsed}
                onCollapse={this.onCollapse}
              >
                <div className="logo" />
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
                  {routesMenu.filter(route => route.roles.includes(me.role)).map(item => {
                    if(item.subComponent){
                      return(
                        <SubMenu
                          key={item.title}
                          title={<span><Icon type={item.icon} /><span>{item.title}</span></span>}
                        >
                          {item.subComponent.map(it => (
                            <Menu.Item key={it.title} >
                              <Link to={it.path} >
                                <Icon type={it.icon} />
                                <span>{it.title}</span>
                              </Link>
                            </Menu.Item>
                          ))}
                        </SubMenu>
                      )
                    }
                    else{
                      return(
                        <Menu.Item key={item.title} >
                          <Link to={item.path} >
                            <Icon type={item.icon} />
                            <span>{item.title}</span>
                          </Link>
                        </Menu.Item>
                      )
                    }
                  })}
                </Menu>
              </Sider>
              <Layout>
                <Header style={{ background: '#fff', padding: 0 }} />
                <Content style={{ margin: '0 16px' }}>
                  <Breadcrumb style={{ margin: '16px 0' }}>
                    <Breadcrumb.Item>User</Breadcrumb.Item>
                    <Breadcrumb.Item>Bill</Breadcrumb.Item>
                  </Breadcrumb>
                  <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
                    <Switch>
                      {routesComp.filter(route => route.component && route.roles.includes(me.role)).map(route => (
                        <Route key={route.path} {...route} />
                      ))}
                      <Route component={Page404} />
                    </Switch>
                  </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                  Ant Design ©2018 Created by Ant UED
                </Footer>
              </Layout>
            </Layout>
          )
        }}
      </Query>
    )
  }
}

export default SiderDemo