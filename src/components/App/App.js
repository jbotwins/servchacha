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
		history: [],
		searchActive: false,
		searchData: [],
		query: ''
	}

	fetchPopular = () => {
		fetch("http://www.reddit.com/subreddits/popular.json")
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
		} else if (this.state.searchActive === true) {
			if (this.state.query.length > 1) {
				// a satifactory search was detected. fetch data and update state.
				const uri = "/subreddits/search.json?q=" + this.state.query;
				const url = "https://www.reddit.com" + uri;
				fetch(url)
				.then(response => response.json())
				.then(data => {
					const currentSearchTerm = this.state.query;
					if (data.data === undefined) {
						console.log(data);
					} else {			
						this.setState({
							searchData: data.data.children,
							searchQueryTerm: currentSearchTerm,
							searchActive: false,
							currentContentType: 'search',
							query: '',
							currentPathName: uri
						});
					}
				});
			} else {
				// an empty search was detected
				this.setState({
					searchActive: false,
					currentContentType: "search-error"
				})
			}
		} else {
			const url = "http://www.reddit.com" + uri + '.json'
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
		// add last url to the history array and updte state as long as it is not a blank search
		if (uri !== "/subreddits/search.json") {
			const historyArray = this.state.history
			historyArray.unshift(uri)
			this.setState({
				history: historyArray
			})
		}
	}

	updateData = (val) => {
		this.setState({
			currentContentType: "loading"
		}, () => {
			// check if on a page other than popular and invoke history update
			if (this.state.currentPathName.length > 1) {
				this.updateHistory(this.state.currentPathName)
			}

			// These statements allow this one function to handle the inital grab of data and following updates

			if (val === undefined && this.state.searchActive === true) {
				// user ran a search
				this.setState({
					currentContentType: "search"
				}, () => {
					// run fetch data function
					this.fetchDataUri()
				})
			}
			if (val === undefined) {
				// user navigated by clicking a link, or its the initial page load
				const pathname = window.location.pathname;
				this.setState({
					currentPathName: pathname
				}, () => {
					// run fetch data function
					this.fetchDataUri()
				})
			} else if (val.slice(0, 26) === "/subreddits/search.json?q=") {
				// user is updating data from the history panel and clicked on a link to a search result. Update with a fresh query.
				const term = val.slice(26)
				this.setState({
					currentContentType: "search",
					query: term,
					searchActive: true
				}, () => {
					// run fetch data function
					this.fetchDataUri()
				})
			} else {
				// non search related path detected. user clicked a link
				this.setState({
					currentPathName: val
				}, () => {
					// run fetch data function
					this.fetchDataUri()
				})
			}
		})

	}

	onSearch = () => {
		// set the table for a search
		this.setState({
			searchData: [],
			searchActive: true
		}, () => {
			// update data
			this.updateData()
			}
		)
	}

	onQueryChange = (ev) => {
		this.setState({query: ev.target.value});
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
						<div className="SearchBox ml-5">
							<input
								placeholder="Start typing..."
								onChange={this.onQueryChange}
								value={this.state.query}
								/>
							<NavLink
								exact to={"/subreddits/search.json?q=" + this.state.query}
								className={"btn btn-outline-success ml-3"}
								activeClassName="active"
								onClick={() => this.onSearch()}
							>
								Search
							</NavLink>

						</div>
					</div>
					</div>
					<div className="row">
						<div className="col-7">
							<div className="row">
								{this.state.currentContentType === 'loading' ?
								<h2>your selection is loading...</h2>
								: null}
								{this.state.currentContentType === 'search-error' ?
								<h2>the search field is blank, please write something...</h2>
								: null}
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
								{/* Conditionally show the search results list of subreddits */}
								{this.state.currentContentType === "search" ?
									<div className="container">
										<h1>Search results: {this.state.searchQueryTerm}</h1>
										{this.state.searchData.map((post, index) => (
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
											<p className="card-text"><strong>Total replies:</strong><br /><a href="https://coderrocketfuel.com/article/recursion-in-react-render-comments-with-nested-children" target="_blank" rel="noopener noreferrer">fancy recursive function coming later...</a></p>
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
