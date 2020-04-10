import React, { Component } from 'react';

import { NavLink } from 'react-router-dom'

import List from '../List/List'
import Post from '../Post/Post'

import Moment from 'react-moment';

class App extends Component {
	state = {
		navigationItems: [
			{
				name: 'Show Popular Subreddits',
				uri: '/'
			}
		],
		fetchedPopular: false,
		currentContentType: '',
		currentPathName: '',
		listData: [],
		history: []

	}

	fetchPopular = () => {
		fetch("https://www.reddit.com/subreddits/popular.json")
			.then(response => response.json())
			.then(data => {
				this.setState({
					fetchedPopular: true,
					popularSubredditData: data.data.children,
				}, () => {
					if (this.state.currentPathName === "/") {
						this.setState({
							currentContentType: 'list'
						});
					}
				});

			});
	}

	fetchDataUri = () => {
		const uri = this.state.currentPathName;
		if (this.state.fetchedPopular === false && uri === "/") {
			this.fetchPopular();
		} else {
			const url = "https://www.reddit.com" + uri + '.json'
			fetch(url)
				.then(response => response.json())
				.then(data => {
					// check if popular data exists, if not get it
					if (this.state.fetchedPopular === false) { this.fetchPopular(); }
					// interpret data type and update state accordingly i.e. list vs. individual post
					if (data.kind === "Listing" && data.data.children !== undefined) {
						this.setState({
							currentContentType: "list",
							listData: data.data.children
						});
					} else if (Array.isArray(data) && data.length === 2 && data[0].kind === "Listing" && data[1].kind === "Listing") {
						this.setState({
							currentContentType: "post",
							postData: data[0].data.children[0].data,
							postCommentData: data[1].data.children
						});
					}
				});
		}
	}

	updateHistory = (uri) => {
		// add last url to the history array and updte state
		const historyArray = this.state.history
		historyArray.unshift(uri)
		this.setState({
			history: historyArray
		})
	}

	updateData = (val) => {
		// check if on a page other than popular and invoke history update
		if (this.state.currentPathName.length > 1) {
			this.updateHistory(this.state.currentPathName)
		}

		// these if statements allow this one function to handle the inital grab of data and following updates
		if (val === undefined) {
			const pathname = window.location.pathname;
			this.setState({
				currentPathName: pathname
			}, () => {
				// run fetch data function
				this.fetchDataUri()
			})
		} else {
			this.setState({
				currentPathName: val
			}, () => {
				// run fetch data function
				this.fetchDataUri()
			})
		}

	}

	componentDidMount() {
		// minimal impact on lifecycle functions
		this.updateData()
	}

	render() {
		return (
			<div className="container">
				<div className="row">
					<div className="row m-5">
						<ul className="nav nav-pills">
							{this.state.navigationItems.map((item, index) => (
								<li key={index} className="nav-item">
									<NavLink
										exact to={item.uri}
										className={"btn btn-outline-success"}
										activeClassName="active"
										onClick={() => this.updateData(item.uri)}
									>
										{item.name}
									</NavLink>
								</li>
							))}
						</ul>
					</div>
				</div>
				<div className="row">
					<div className="col-7">
						<div className="row">
							{/* Conditionally show the popular list of subreddits */}
							{this.state.currentContentType === "list" && this.state.currentPathName === "/" ?
								<div className="container">
									<h1>Popular Subreddits Right Now:</h1>
									{this.state.popularSubredditData.map((post, index) => (
										<List
											key={index}
											isPopular={true}
											title={post.data.title}
											type="subreddit"
											description={post.data.description}
											url={post.data.url}
											linkName="Go to subreddit"
											onClickLink={this.updateData}
										></List>
									)
									)}
								</div>
								: null}
							{/* Conditionally show list of posts */}
							{this.state.currentContentType === "list" && this.state.currentPathName !== "/" ?
								<div className="container">
									<h1>{this.state.currentPathName}</h1>
									{this.state.listData.map((post, index) => (
										<List
											key={index}
											isPopular={false}
											title={post.data.title}
											description={post.data.selftext}
											post_hint={post.data.post_hint}
											imageUrl={post.data.thumbnail}
											imageHeight={post.data.thumbnail_height}
											imageWidth={post.data.thumbnail_width}
											permalink={post.data.permalink}
											linkName="Show full post"
											onClickLink={this.updateData}
										></List>
									)
									)}
								</div>
								: null}
							{/* Conditionally show post body */}
							{this.state.currentContentType === "post" ?
								<Post
									data={this.state.postData}
									comments={this.state.postCommentData}>
								</Post>
								: null}
							{this.state.currentContentType === '' ? <h2>Content loading...</h2> : null}
						</div>
					</div>
					<div className="container col-4">
						{/* Conditionally show post meta data block */}
						{this.state.currentContentType === "post" ?
							<div className="row ml-3">
								<div className="card">
									<div className="card-body">
										<p className="card-title"><strong>Author:</strong><br />{this.state.postData.author}</p>
										<p className="card-text"><strong>Date Posted:</strong><br /><Moment unix>{this.state.postData.created_utc}</Moment></p>
										<p className="card-text"><strong>Direct comment count:</strong><br />{this.state.postCommentData.length}</p>
										<p className="card-text"><strong>Total replies:</strong><br />fancy recursive function coming later...</p>
										<p className="card-text"><strong>Link to thing:</strong><br /><a href={this.state.postData.url} rel="noopener noreferrer" target="_blank" >{this.state.postData.url}</a></p>
									</div>
								</div>
							</div>
							: null
						}
						{/* Conditionally show the history block */}
						{this.state.history.length > 0 ?
							<div className="row mt-5 ml-3">
								<div className="card">
									<div className="card-body">
										<h4>Browsing History</h4>
										<ul className="list-group">
											{this.state.history.map((item, index) => (
												<li className="list-group-item">
													<NavLink
														exact to={item}
														key={index}
														onClick={() => this.updateData(item)}
													>
														{item}
													</NavLink>
												</li>
											)
											)}
										</ul>
									</div>
								</div>
							</div>
							: null
						}
					</div>
				</div>
			</div >
		);
	}
}
export default App;
