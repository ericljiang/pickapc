import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import './material-shadows.css';
import fetchPosts from './pickapc'

class App extends Component {
  constructor(props) {
    super(props);
    this.handleLimitChange = this.handleLimitChange.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
    this.state = { limit: 10, sort: "hot" };
  }

  handleLimitChange(e) {
    this.setState({ limit: e.target.value });
  }

  handleSortChange(e) {
    this.setState({ sort: e.target.value });
  }

  render() {
    const limit = this.state.limit;
    const sort = this.state.sort;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to pickapc</h1>
          <p>
            Fetch <input id="limitInput" type="number" value={limit} onChange={this.handleLimitChange}/> posts
            from /r/buildapc/
            <select id="sortSelect" value={sort} onChange={this.handleSortChange}>
              <option>hot</option>
              <option>top</option>
              <option>new</option>
            </select>
          </p>
        </header>
        <Listing sort={sort} limit={parseInt(limit)} />
      </div>
    );
  }
}

class Listing extends Component {
  constructor(props) {
    super(props);
    this.reloadPosts = this.reloadPosts.bind(this);
    this.state = { posts: [], loading: false };
  }

  componentWillMount() {
    this.reloadPosts(this.props.sort, this.props.limit);
  }

  componentWillReceiveProps(nextProps) {
    if (!isNaN(nextProps.limit)) {
      this.reloadPosts(nextProps.sort, nextProps.limit);
    }
  }

  reloadPosts(sort, limit) {
    this.setState({ loading: true });
    fetchPosts(sort, limit, posts => {
      this.setState({ posts: posts, loading: false });
    });
  }

  render() {
    if (this.state.loading) {
      return (
        <Loading />
      )
    } else {
      return (
        <table>
          <tbody>
            {this.state.posts.map(post =>
              <Post post={post} key={post.name} />
            )}
          </tbody>
        </table>
      );
    }
  }
}

/**
 * Renders a loading indicator.
 * @param {Object} props
 */
function Loading(props) {
  return (
    <img src={logo} className="Loading-indicator" alt="loading" />
  );
}

/**
 * Renders a single post.
 * @param {Object} props
 */
function Post(props) {
  return (
    <tr className="dp-2">
      <Score score={props.post.score} />
      <Title title={props.post.title} url={props.post.url} numComments={props.post.num_comments} />
      <Total total={props.post.partsList["Total"]}
             url={"https://pcpartpicker.com/list/" + props.post.listId}/>
    </tr>
  );
}

function Score(props) {
  return (
    <td className="score">
      {props.score}
    </td>
  )
}

function Title(props) {
  var comments = props.numComments + " comment";
  if (props.numComments !== 1) { // plural
    comments += "s"
  }
  return (
    <td className="title">
      <a href={props.url}>
        {props.title}
        <p>{comments}</p>
      </a>
    </td>
  )
}

function Total(props) {
  return (
    <td className="total">
      <a href={props.url}
        style={{ color: priceColor(props.total) }}>
        {props.total}
      </a>
    </td>
  )
}

function priceColor(price) {
  var r = 64;
  var g = 255 - parseInt(price.replace("$", "") / 3000 * 255, 10);
  var b = 255;
  return "rgb(" + [ r, g, b ].join(", ") + ")";
}

export default App;
