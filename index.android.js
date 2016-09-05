/**
 * By Willianson Araujo
 * At 2016-08-30
 */



import React, { Component } from 'react';
import { AppRegistry, DrawerLayoutAndroid, Image, ListView, StyleSheet, StatusBar, Text, ToolbarAndroid, TouchableHighlight, View } from 'react-native';
import { Icon } from 'react-native-material-design';



const COMMITS_PER_PAGINA = 20;



/* Module: Project
---------------------------------------------------------------------------------------*/
class Project extends Component
{
	render()
	{
		return (
			<View style={[styles.item, styles.projectItem]}>
				<TouchableHighlight onPress={() => {this.props.onItemPress(this.props.projectName)}}>
					<Text style={[styles.itemText]}>
						{this.props.stargazers_count} : {this.props.projectName}
					</Text>
				</TouchableHighlight>
			</View>
		);
	}
}



/* Module: ProjectList
---------------------------------------------------------------------------------------*/
class ProjectList extends Component
{ 
	render()
	{
		return ( 
			<ListView
				enableEmptySections
				style={styles.list}
				dataSource={this.state.dataSourceProjects}
				renderRow={(rowData) => <Project 
											stargazers_count={rowData.stargazers_count} 
											projectName={rowData.name} 
											onItemPress={(projectName)=>this.props.onItemPress(projectName)}>
										</Project>}
			/>
		);
	}

	
	constructor(props)
	{
			super(props);
		var ds      = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
		this.state    = { dataSourceProjects: ds.cloneWithRows(projects) };
		this.getProjects();
	}


	async getProjects()
	{
		try
		{
			let response    = await fetch('https://api.github.com/search/repositories?q=user:globocom&sort=stars&order=desc');
			let responseJson  = await response.json();

			var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
			this.setState({ dataSourceProjects: ds.cloneWithRows(responseJson.items) });
		}
		catch(error)
		{
			console.error(error);
		}
	}
}



/* App
---------------------------------------------------------------------------------------*/
class GithubViewer extends Component
{
	render()
	{
		return (

			<DrawerLayoutAndroid
				ref="leftDrawer"
				drawerWidth={300}
				drawerPosition={DrawerLayoutAndroid.positions.Left}
				renderNavigationView={this.navigationView} >

				<ToolbarAndroid
					navIcon={require('./images/menu.png')}
					onIconClicked={this.openLeftDrawer}
					titleColor="#FFF"
					style={styles.toolbar}
					title="Github Viewer" />

				<View style={styles.stage}>
					<StatusBar
						backgroundColor="#025187"
						barStyle="light-content"/>

					<View style={styles.stageHeader}>
						<Text style={styles.title}>{this.state.projectDetails.name}</Text>
						<Text style={styles.label}>{this.state.projectDetails.description}</Text>

						<View ref="counters" style={[styles.counters, styles.countersHide]}>
							<View style={{flex: 1, alignItems: 'center'}}>
								<Icon name="star" color="rgba(0,0,0,0.4)" size={60} />
								<Text style={styles.counterText}>{this.state.projectDetails.stargazers_count}{'\n'}</Text>
							</View>
							<View style={{flex: 1, alignItems: 'center'}}>
								<Icon name="call-split" color="rgba(0,0,0,0.4)" size={60} />
								<Text style={styles.counterText}>{this.state.projectDetails.forks_count}{'\n'}</Text>
							</View>
						</View>
					</View>

					<ListView 
						enableEmptySections
						style={[styles.padding, styles.list, styles.commitList]}
						dataSource={this.state.commits}
						renderRow={this._renderRow}
						/>
				</View>
			</DrawerLayoutAndroid>
		);
	}

	constructor(props)
	{
		super(props);
		var ds 		= new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
		this.state 	= {
			projectDetails: projectDetails,
			commits: ds.cloneWithRows([])
		};
	}


	openLeftDrawer = () => {
		this.refs.leftDrawer.openDrawer()
	};


	closeLeftDrawer = () => {
		this.refs.leftDrawer.closeDrawer()
	};


	// left
	navigationView = () =>
	{
		return (
			<View style={[styles.leftDrawer]}>
				<View style={{flex: 0, flexDirection: 'row', height: 90}}>
					<Text style={[styles.padding, styles.title, styles.colorWhite, {flex: 3}]}>Projects</Text>
					<Text style={[styles.padding, styles.title, styles.colorWhite, styles.opacity5, {flex: 0}]} onPress={this.closeLeftDrawer}>
						<Icon name="arrow-back" color="rgba(0,0,0,0.4)" />
					</Text>
				</View>

				<ProjectList style={{flex: 1}} onPress={this.closeLeftDrawer} onItemPress={(projectName)=>this.getProjectDetails(projectName)}></ProjectList>

				<View>
					<Text style={[styles.opacity3, styles.padding, styles.label, styles.colorWhite]}>React Native</Text>
				</View>
			</View>
		)
	};


	_renderRow = (rowData) =>
	{
		return (
			<View style={[styles.item, styles.commitItem, {flexDirection: 'row'}]}>
				<Text style={[styles.commitItemText, styles.opacity5, {flex:0, width: 60}]} ellipsizeMode='tail' numberOfLines={1}>{rowData.sha}</Text>
				<View style={{flex:1, paddingLeft: 10}}>
					<Text style={[styles.commitItemText]}>{rowData.commit_message}{"\n"}</Text>
					<Text style={[styles.commitItemText, styles.opacity5]}>{"- "}{rowData.author_name}</Text>
				</View>
			</View>
		);
	};


	async getProjectDetails(projectName)
	{
		try
		{
			this.closeLeftDrawer();

			// get_details
			let response 		= await fetch('https://api.github.com/repos/globocom/'+projectName);
			let responseJson 	= await response.json();

			// update
			this.setState({
				projectDetails: responseJson
			});

			// get_commits
			this.refs.counters.setNativeProps({ style: styles.countersShow });
			let responseCommits 	= await fetch('https://api.github.com/repos/globocom/'+projectName+'/commits?sort=newest&order=desc&page=1&per_page='+COMMITS_PER_PAGINA);
			let responseCommitsJson = await responseCommits.json();
			var ds 					= new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

			// data
			responseCommitsJson.forEach((child) => 
			{
				child['author_name'] 	= child['commit']['author']['name'];
				child['commit_message'] = child['commit']['message'];
			});

			// update
			this.setState({
				commits: ds.cloneWithRows(responseCommitsJson)
			});
		}
		catch(error)
		{
			console.error(error);
		}
	} 
}



/* Styles
---------------------------------------------------------------------------------------*/
var styles = StyleSheet.create({
	opacity5: 		{ opacity:0.5 },
	opacity3: 		{ opacity:0.3 },
	leftDrawer: 	{ flex:1,  backgroundColor:'#0068AE' },
	toolbar: 		{ height:55, backgroundColor:'#0068AE' },
	stage: 			{ flex:1 },
	stageHeader: 	{ padding:25, borderBottomWidth:1, borderBottomColor:'#E0E0E0', borderStyle:'solid' },
	padding: 		{ padding:25 },
	label: 			{ fontSize:14, color:'#999' },
	title: 			{ marginBottom:10, fontSize:22 },
	list: 			{ paddingBottom:25 },
	item: 			{ borderBottomWidth:1, borderBottomColor:'rgba(0,0,0,0.1)', borderStyle:'solid' },
	itemText: 		{ opacity:0.5, padding:25, paddingTop:15, paddingBottom:15, color:'#FFF' },
	colorWhite: 	{ color:'#FFF' },
	countersShow: 	{ position:'relative', flex:1, flexDirection:'row', margin:20, marginBottom:0, left:0 },
	countersHide: 	{ position:'absolute',  left:999 },
	counterText: 	{ fontSize:22, textAlign:'center' },
	commitList: 	{ flex:1, paddingBottom:20, backgroundColor:'#EEE' },
	commitItem: 	{ marginBottom:20, paddingBottom:20 },
});



/* Instance
---------------------------------------------------------------------------------------*/
var projects    = [{name: 'Loading'}];
var projectDetails  = {name: 'Welcome', description: 'Use left menu to see all projects.'};

AppRegistry.registerComponent('GithubViewer', () => GithubViewer);
