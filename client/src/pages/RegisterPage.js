import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Register from '../components/auth/Register';

const RegisterPage = () => {
  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={6}>
          <Register />
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;
