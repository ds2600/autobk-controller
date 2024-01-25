import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";

import AuthService from "../services/auth.service";

import { withRouter } from '../common/with-router';

const required = value => {
    if (!value) {
        return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            This field is required!
        </div>
        );
    }
    };

    class Login extends Component {
    constructor(props) {
        super(props);
        this.handleLogin = this.handleLogin.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);

        this.state = {
        email: "",
        password: "",
        loading: false,
        message: ""
        };
    }

    onChangeEmail(e) {
        this.setState({
        email: e.target.value
        });
    }

    onChangePassword(e) {
        this.setState({
        password: e.target.value
        });
    }

    handleLogin(e) {
        e.preventDefault();

        this.setState({
        message: "",
        loading: true
        });

        this.form.validateAll();

        if (this.checkBtn.context._errors.length === 0) {
        AuthService.login(this.state.email, this.state.password).then(
            () => {
            this.props.router.navigate("/profile");
            window.location.reload();
            },
            error => {
            const resMessage =
                (error.response &&
                error.response.data &&
                error.response.data.message) ||
                error.message ||
                error.toString();

            this.setState({
                loading: false,
                message: resMessage
            });
            }
        );
        } else {
        this.setState({
            loading: false
        });
        }
    }
    render() {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="w-full max-w-sm">
                    <form onSubmit={this.handleLogin} ref={c => { this.form = c; }} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                        <div className="mb-4">
                            <div className="flex justify-center mb-6">
                                <img src="/AutoBk.svg" alt="Logo" className="h-72" />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                    Email
                                </label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    value={this.state.email}
                                    onChange={this.onChangeEmail}
                                    validations={[required]}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                    Password
                                </label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    value={this.state.password}
                                    onChange={this.onChangePassword}
                                    validations={[required]}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" 
                                    required
                                />
                            </div>

                            {error && <p className="text-red-500 text-sm mb-6 text-center italic">{error}</p>}

                            <div className="flex items-center justify-center">
                                <button 
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" 
                                    type="submit" 
                                    disabled={this.state.loading}>
                                    { this.state.loading && (
                                        <span className="p5">Loading...</span>
                                    )}
                                    Login
                                </button>
                            </div>

                            {this.state.message && (
                                <div className="form-group">
                                    <div className="alert alert-danger" role="alert">
                                        {this.state.message}
                                    </div>
                                </div>
                            )}
                            <CheckButton
                                style={{ display: "none" }}
                                ref={c => {
                                    this.checkBtn = c;
                                }}
                            />
                        </div>
                    </form>
                </div>
            </div>
        );
    }
};

export default withRouter(Login);
