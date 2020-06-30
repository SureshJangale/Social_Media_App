import React, { Component } from 'react'
import { isAuthenticated } from '../auth'
import { read, update, updateUser } from './apiUser'
import { Redirect } from "react-router-dom"
import DefaultProfile from '../images/avatar.jpeg'


export default class EditProfile extends Component {
    constructor() {
        super()
        this.state = {
            id: "",
            name: "",
            email: "",
            password: "",
            error: "",
            redirectToProfile: false,
            fileSize: 0,
            loading: false,
            about: ""
        }
    }


    componentDidMount() {
        this.userData = new FormData()
        const userId = this.props.match.params.userId;
        this.init(userId);
    }


    isValid = () => {
        const { name, email, password, fileSize } = this.state

        if (fileSize > 100000) {
            this.setState({ error: "File Size should be less than 100kb", loading:false })
            return false;
        }

        if (name.length === 0) {
            this.setState({ error: "Name is required", loading:false })
            return false;
        }
        if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) {
            this.setState({ error: "Email is Invalid",loading:false })
            return false;
        }
        if (password.length >= 1 && password.length <= 5) {
            this.setState({
                loading:false,
                error: "Password must be at least 6 characters long"
            })
            return false;
        }
        return true;
    }

    handleChange = name => event => {
        this.setState({ error: ""})
        const value = (name === 'photo') ? event.target.files[0] : event.target.value
        const fileSize = (name === 'photo') ? event.target.files[0].size : 0
        this.userData.set(name, value)
        this.setState({ [name]: value, fileSize })
    };

    clickSubmit = event => {
        event.preventDefault()
        this.setState({ loading: true })

        if (this.isValid()) {
            const userId = this.props.match.params.userId;
            const token = isAuthenticated().token;

            update(userId, token, this.userData)
                .then(data => {
                    if (data.error)
                        this.setState({ error: data.error })
                    else {
                        updateUser(data, () => {
                            this.setState({
                                redirectToProfile: true
                            })
                        })
                    }
                })
        }
    };

    init = (userId) => {
        const token = isAuthenticated().token;
        read(userId, token)
            .then(data => {
                if (data.error) {
                    this.setState({ redirectToSignin: true });
                } else {
                    this.setState({
                        id: data._id,
                        name: data.name,
                        email: data.email,
                        error: '',
                        about: data.about
                    })
                }
            })
    }

    signupForm = (name, email, password, about) => {
        return (
            <form>
                <div className="form-group">
                    <label className="text-muted">Profile Photo</label>
                    <input
                        onChange={this.handleChange("photo")}
                        type="file"
                        accept="image/*"
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label className="text-muted">Name</label>
                    <input
                        onChange={this.handleChange("name")}
                        type="text"
                        className="form-control"
                        value={name}
                    />
                </div>

                <div className="form-group">
                    <label className="text-muted">Email</label>
                    <input
                        onChange={this.handleChange("email")}
                        type="email"
                        className="form-control"
                        value={email}
                    />
                </div>

                <div className="form-group">
                    <label className="text-muted">About</label>
                    <textarea
                        onChange={this.handleChange("about")}
                        type="text"
                        className="form-control"
                        value={about}
                    />
                </div>

                <div className="form-group">
                    <label className="text-muted">Password</label>
                    <input onChange={this.handleChange("password")}
                        type="password"
                        className="form-control"
                        value={password}
                    />
                </div>

                <button
                    onClick={this.clickSubmit}
                    className="btn btn-raised btn-primary">Update</button>
            </form>
        )
    }


    render() {
        const { id,
            name,
            email,
            password,
            redirectToProfile,
            error,
            loading,
            about
        } = this.state

        if (redirectToProfile) {
            return <Redirect to={`/user/${id}`} />
        }

        const photoUrl = id ? `${process.env.REACT_APP_API_URL}/user/photo/${id}?${new Date().getTime()}` : DefaultProfile

        return (
            <div className="container">
                <h2 className="mt-5 mb-5">Edit Profile</h2>
                <div
                    className="alert alert-danger"
                    style={{ display: error ? "" : "none" }}
                >
                    {error}
                </div>
                {loading ? (<div className="jumbotron text-center">
                    <h2>Loading...</h2>
                </div>
                ) : (
                        ""
                    )}

                <img
                    className="img-thumbnail"
                    src={photoUrl}
                    onError={i => (i.target.src = `${DefaultProfile}`)}
                    alt={name}
                    style={
                        { height: "200px", width: "auto" }
                    } />
                {this.signupForm(name, email, password, about)}
            </div>
        )
    }
}