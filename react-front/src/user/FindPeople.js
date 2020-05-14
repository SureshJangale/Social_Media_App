import React, { Component } from 'react'
import { Link } from "react-router-dom"
import { findPeople, follow } from './apiUser'
import DefaultProfile from '../images/avatar.jpeg'
import {isAuthenticated} from '../auth'

export default class FindPeople extends Component {
    constructor() {
        super()
        this.state = {
            users: [],
            open:false,
            followMessage:""
        }
    }

    componentDidMount() {
        const userId = isAuthenticated().user._id
        const token = isAuthenticated().token
        findPeople(userId, token).then(data => {
            if (data.error) {
                console.log(data.error);
            } else {
                this.setState({ users: data })
            }
        })
    }

    clickFollow = (user, i) => {
        const userId = isAuthenticated().user._id;
        const token = isAuthenticated().token

        follow(userId, token, user._id)
        .then(data => {
            if(data.error){
                this.setState({error:data.error})
            } else {
                let toFollow = this.state.users
                toFollow.splice(i, 1)
                this.setState({
                    users:toFollow,
                    open:true,
                    followMessage:`Following ${user.name}`
                })
            }
        })
    }

    renderUsers = (users) => (
        <div className="row">
            {
                users.map((user, i) =>
                    (
                        <div className="card col-md-4" key={i}>
                            <img
                                className="img-thumbnail"
                                src={`${process.env.REACT_APP_API_URL}/user/photo/${user._id}`}
                                onError={i => (i.target.src = `${DefaultProfile}`)}
                                alt={user.name}
                                style={
                                    { height: "200px", width: "auto" }
                                }
                            />
                            <div className="card-body">
                                <h5 className="card-title">{user.name}</h5>
                                <p className="card-text">{user.email}</p>
                                <Link
                                    to={`user/${user._id}`}
                                    className="btn btn-primary btn-raised btn-sm"
                                >
                                    View Profile
                                </Link>

                                <button onClick={() => this.clickFollow(user, i)} className="btn btn-raised btn-info float-right">
                                    Follow
                                </button>
                            </div>
                        </div>
                    )
                )}
        </div>
    )
    render() {
        const { users, open, followMessage} = this.state;
        return (
            <div className="container">
                <h2 className="mt-5 mb-5">Users</h2>
                {open &&
                    <div className="alert alert-success">
                    <p>{followMessage}</p>
                </div>
                 }
                {this.renderUsers(users)}
            </div>
        );
    }
}
