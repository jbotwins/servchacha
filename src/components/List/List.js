import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown';

import './List.css';

class List extends Component {
    shorten(str) {
        // shortens lengthy descriptions to teaser length
        const teaser = str.slice(0, 200)
        return teaser
    }

    render() {
        return (
            <div className="row">
                <div className="col">
                    <div className="card">
                        <div className="card-body">
                            <h1 className="card-title">{this.props.title}</h1>
                            <p className="card-text">
                                {/* Conditionally show description trimmed to teaser length */}
                                {!this.props.description
                                    ? null :
                                    <ReactMarkdown
                                        source={this.shorten(this.props.description)}
                                    />
                                }
                            </p>
                            {/* Conditonally show an image with link */}
                            {this.props.post_hint === "image" ?
                                <div className="row">
                                    <Link
                                        exact to={this.props.permalink}
                                        onClick={this.props.onClickLink.bind(this, this.props.permalink)}
                                    >
                                        <img
                                            className="ml-3 mb-3"
                                            src={this.props.imageUrl}
                                            alt=""
                                            height={this.props.imageHeight}
                                            width={this.props.imageWidth}
                                        />
                                    </Link>

                                </div>
                                : null
                            }
                            {/* Conditionally show link is its a post from the popular subreddit list */}
                            {this.props.url === undefined
                                ? null :
                                <Link
                                    exact to={this.props.url}
                                    className="btn btn-outline-success"
                                    onClick={this.props.onClickLink.bind(this, this.props.url)}
                                >{this.props.linkName}
                                </Link>}
                            {/* Conditionally show link is its a post from a subreddit */}
                            {this.props.permalink === undefined
                                ? null :
                                <Link
                                    exact to={this.props.permalink}
                                    className="btn btn-outline-success"
                                    onClick={this.props.onClickLink.bind(this, this.props.permalink)}
                                >{this.props.linkName}
                                </Link>}
                        </div>
                    </div>
                    <br />
                </div>
            </div>
        )
    }
}
export default List;