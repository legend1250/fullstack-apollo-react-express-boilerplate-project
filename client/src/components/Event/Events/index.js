import React, { Component, Fragment } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import EventItem from '../EventItem'
// import EventDelete from '../EventDelete';
import Loading from '../../Loading';

const EVENT_CREATED = gql`
  subscription {
    eventCreated {
      event {
        id
        title
        description
        createdAt
        user {
          id
          username
        }
      }
    }
  }
`;

const GET_PAGINATED_EVENTS_WITH_USERS = gql`
  query($cursor: String, $limit: Int!) {
    events(cursor: $cursor, limit: $limit)
      @connection(key: "EventConnection") {
      edges {
        id
        title
        description
        createdAt
        user {
          id
          username
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const Events = ({ limit, me }) => (
  <Query
    query={GET_PAGINATED_EVENTS_WITH_USERS}
    variables={{ limit }}
  >
    {({ data, loading, error, fetchMore, subscribeToMore }) => {
      if (!data) {
        return (
          <div>
            There are no events yet ... Try to create one by
            yourself.
          </div>
        );
      }

      const { events } = data;

      if (loading || !events) {
        return <Loading />;
      }

      const { edges, pageInfo } = events;

      return (
        <Fragment>
          <EventList
            events={edges}
            me={me}
            subscribeToMore={subscribeToMore}
          />

          {pageInfo.hasNextPage && (
            <MoreEventsButton
              limit={limit}
              pageInfo={pageInfo}
              fetchMore={fetchMore}
            >
              More
            </MoreEventsButton>
          )}
        </Fragment>
      );
    }}
  </Query>
);

const MoreEventsButton = ({
  limit,
  pageInfo,
  fetchMore,
  children,
}) => (
  <button
    type="button"
    onClick={() =>
      fetchMore({
        variables: {
          cursor: pageInfo.endCursor,
          limit,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return previousResult;
          }

          return {
            events: {
              ...fetchMoreResult.events,
              edges: [
                ...previousResult.events.edges,
                ...fetchMoreResult.events.edges,
              ],
            },
          };
        },
      })
    }
  >
    {children}
  </button>
);

class EventList extends Component {
  subscribeToMoreEvent = () => {
    this.props.subscribeToMore({
      document: EVENT_CREATED,
      updateQuery: (previousResult, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return previousResult;
        }

        const { eventCreated } = subscriptionData.data;

        return {
          ...previousResult,
          events: {
            ...previousResult.events,
            edges: [
              eventCreated.event,
              ...previousResult.events.edges,
            ],
          },
        };
      },
    });
  };

  componentDidMount() {
    this.subscribeToMoreEvent();
  }

  render() {
    const { events, me } = this.props;

    return events.map(event => (
      <EventItem key={event.id} event={event} me={me} />
    ));
  }
}

// const MessageItem = ({ message, me }) => (
//   <div>
//     <h3>{message.user.username}</h3>
//     <small>{message.createdAt}</small>
//     <p>{message.text}</p>

//     {me &&
//       message.user.id === me.id && (
//         <MessageDelete message={message} />
//       )}
//   </div>
// );

export default Events;
