import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { getProducts, getBrainTreeClientToken, processPayment } from './apiCore';
import { emptyCart } from './cartHelpers';
import Card from './Card';
import { isAuthenticated } from '../auth';
import { Link } from 'react-router-dom';
import DropIn from 'braintree-web-drop-in-react';

const Checkout = ({ products, setRun = f => f, run = undefined }) => {
    const [data, setData] = useState({
        loading: false,
        success: false,
        clientToken: null,
        error: '',
        instance: {},
        address: ''
    });

    const userId = isAuthenticated() && isAuthenticated().user._id;
    const token = isAuthenticated() && isAuthenticated().token;

    const getToken = (userId, token) => {
        getBrainTreeClientToken(userId, token).then(data => {
            if (data.error) {
                //console.log(data.error);
                setData({ ...data, error: data.error });
            } else {
                //console.log(data);
                setData({ clientToken: data.clientToken });
            }
        });
    };

    useEffect(() => {
        getToken(userId, token)
    }, [])

    const getTotal = () => {
        return products.reduce((currentValue, nextValue) => {
            return currentValue + nextValue.count * nextValue.price;
        }, 0)
    }

    const showCheckOut = () => {
        return isAuthenticated() ? (
            <div>{showDropIn()}</div>
        ) : (
            <Link to='/signin'>
                <button className='btn btn-primary'>Sign in to checkout</button>
            </Link>
        )
    }

    const buy = () => {
        setData({ loading: true });
        let nonce;
        let getNonce = data.instance.requestPaymentMethod()
            .then(data => {
                nonce = data.nonce;
                const paymentData = {
                    paymentMethodNonce: nonce,
                    amount: getTotal(products)
                }

                processPayment(userId, token, paymentData)
                    .then(response => {
                        setData({ ...data, success: response.success });
                        emptyCart(() => {
                            setRun(!run);
                            console.log('payment successful & empty cart');
                            setData({
                                loading: false,
                                success: true
                            })
                        });
                    })
                    .catch(error => {
                        console.log(error)
                        setData({ loading: false });
                    });
            })
            .catch(error => {
                setData({ ...data, error: error.message })
            })
    }

    const showDropIn = () => (
        <div onBlur={() => setData({ ...data, error: '' })}>
            {data.clientToken !== null && products.length > 0 ? (
                <div>
                    <DropIn options={{
                        authorization: data.clientToken,
                        paypal: {
                            flow: 'vault'
                        }
                    }} onInstance={instance => (data.instance = instance)} />
                    <button onClick={buy} className='btn btn-success btn-block'>Buy Now</button>
                </div>
            ) : null}
        </div>
    )

    const showError = error => (
        <div className='alert alert-danger' style={{ display: error ? '' : 'none' }}>
            {error}
        </div>
    );

    const showSuccess = success => (
        <div className='alert alert-info' style={{ display: success ? '' : 'none' }}>
            Thanks! Your payment was successful.
        </div>
    );

    const showLoading = (loading) => loading && <h2>Loading....</h2>;

    return (
        <div>
            <h2>Total: ${getTotal()}</h2>
            {showLoading(data.loading)}
            {showSuccess(data.success)}
            {showError(data.error)}
            {showCheckOut()}
        </div>
    );
};

export default Checkout;