import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Login from '../components/auth/Login';

const LoginPage = () => {
  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={6}>
          <Login />
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
