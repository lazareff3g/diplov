import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <Container>
        <Row>
          <Col md={6}>
            <h5>ФотоЛокации</h5>
            <p>Информационная система поиска интересных мест для фотографии</p>
          </Col>
          <Col md={3}>
            <h5>Ссылки</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-light">Главная</a></li>
              <li><a href="/locations" className="text-light">Локации</a></li>
              <li><a href="/login" className="text-light">Вход</a></li>
            </ul>
          </Col>
          <Col md={3}>
            <h5>Контакты</h5>
            <ul className="list-unstyled">
              <li>Email: info@photolocations.ru</li>
              <li>Телефон: +7 (123) 456-78-90</li>
            </ul>
          </Col>
        </Row>
        <hr className="my-3" />
        <Row>
          <Col className="text-center">
            <p className="mb-0">&copy; {new Date().getFullYear()} ФотоЛокации. Все права защищены.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
