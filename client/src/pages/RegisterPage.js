// client/src/pages/RegisterPage.js
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Register from '../components/auth/Register';

const RegisterPage = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center bg-primary bg-opacity-10">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Register />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RegisterPage;
