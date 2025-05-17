import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const HomePage = () => {
  return (
    <Container>
      <Row className="mb-5">
        <Col>
          <div className="jumbotron bg-light p-5 rounded">
            <h1 className="display-4">Найдите идеальное место для фотосессии</h1>
            <p className="lead">
              Наша информационная система поможет вам найти интересные локации для фотографии
              в вашем городе и его окрестностях.
            </p>
            <hr className="my-4" />
            <p>
              Просматривайте локации на карте, фильтруйте по категориям, времени суток и сезону,
              добавляйте свои любимые места и делитесь ими с сообществом.
            </p>
            <Link to="/locations">
              <Button variant="primary" size="lg">Найти локации</Button>
            </Link>
          </div>
        </Col>
      </Row>

      <h2 className="text-center mb-4">Как это работает</h2>
      <Row className="mb-5">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="bi bi-search" style={{ fontSize: '2rem' }}></i>
              </div>
              <Card.Title>Поиск</Card.Title>
              <Card.Text>
                Используйте фильтры для поиска идеальной локации по категории, времени суток,
                сезону и другим параметрам.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="bi bi-map" style={{ fontSize: '2rem' }}></i>
              </div>
              <Card.Title>Просмотр на карте</Card.Title>
              <Card.Text>
                Просматривайте локации на интерактивной карте и получайте подробную информацию
                о каждом месте.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="bi bi-plus-circle" style={{ fontSize: '2rem' }}></i>
              </div>
              <Card.Title>Добавление</Card.Title>
              <Card.Text>
                Делитесь своими находками с сообществом, добавляя новые локации и фотографии.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h2 className="text-center mb-4">Популярные категории</h2>
      <Row>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Img variant="top" src="https://via.placeholder.com/300x200?text=Природа" />
            <Card.Body>
              <Card.Title>Природа</Card.Title>
              <Link to="/locations?category=1">
                <Button variant="outline-primary" size="sm">Смотреть локации</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Img variant="top" src="https://via.placeholder.com/300x200?text=Архитектура" />
            <Card.Body>
              <Card.Title>Архитектура</Card.Title>
              <Link to="/locations?category=2">
                <Button variant="outline-primary" size="sm">Смотреть локации</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Img variant="top" src="https://via.placeholder.com/300x200?text=Городской+пейзаж" />
            <Card.Body>
              <Card.Title>Городской пейзаж</Card.Title>
              <Link to="/locations?category=3">
                <Button variant="outline-primary" size="sm">Смотреть локации</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Img variant="top" src="https://via.placeholder.com/300x200?text=Водоемы" />
            <Card.Body>
              <Card.Title>Водоемы</Card.Title>
              <Link to="/locations?category=5">
                <Button variant="outline-primary" size="sm">Смотреть локации</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
