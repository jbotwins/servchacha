import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';
import parse from 'html-react-parser';

class Post extends Component {
    htmlReactParser(input) {
        let parsed = parse(input);
        const output = { __html: parsed }
        return output
    }

    render() {
        return (
            <div className="container">
                <div className="row">
                    <h1>{this.props.data.title}</h1>
                    {/* These four separate conditional expressions show post data based on availability */}
                    {this.props.data.thumbnail !== null ?
                        <div className="row">
                            <img className="ml-3 mb-3" src={this.props.data.url} alt="" />
                        </div>
                        : null
                    }
                    {this.props.data.thumbnail === "self" ?
                        <div className="row">
                            <ReactMarkdown source={this.props.data.selftext} />
                        </div>
                        : null
                    }
                    {this.props.data.post_hint === "link" && this.props.data.media !== null ?
                        <div className="row">
                            <div dangerouslySetInnerHTML={this.htmlReactParser(this.props.data.media.oembed.html)} />
                        </div>
                        : null
                    }
                    {this.props.data.url !== null ?
                        <div className="row">
                            <a href={this.props.data.url} rel="noopener noreferrer" target="_blank" >{this.props.data.url}</a>
                        </div>
                        : null
                    }
                </div>
            </div>
        );
    }
}

export default Post;