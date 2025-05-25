// client/src/pages/LoginPage.js
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Login from '../components/auth/Login';

const LoginPage = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Login />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;
