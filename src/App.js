import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import './material-shadows.css';
import fetchPosts from './pickapc'

class App extends Component {
  constructor(props) {
    super(props);
    this.handleLimitChange = this.handleLimitChange.bind(this);
    this.state = { limit: 10 };
  }

  handleLimitChange(e) {
    this.setState({ limit: e.target.value });
  }

  render() {
    const limit = this.state.limit;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to pickapc</h1>
          <input value={limit} onChange={this.handleLimitChange}/>
        </header>
        <Listing sort="hot" limit={parseInt(limit)} />
      </div>
    );
  }
}

class Listing extends Component {
  constructor(props) {
    super(props);
    this.state = { posts: [] };
  }

  render() {
    if (!isNaN(this.props.limit) && this.state.posts.length !== this.props.limit) {
      fetchPosts(this.props.sort, this.props.limit, posts => {
        this.setState({
          posts: posts
        });
      });
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
