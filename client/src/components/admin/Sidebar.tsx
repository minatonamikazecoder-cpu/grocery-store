import React, { useState } from "react";
import { Link } from "react-router-dom";
const Sidebar = ({isSidebarToggled}) => {

  
  return (

        <div id="layoutSidenav_nav"  className={isSidebarToggled ? "sb-sidenav-toggled" : ""}>
          <nav className="sb-sidenav accordion sb-sidenav-light border-end">
            <div className="sb-sidenav-menu">
              <div className="nav">
                <Link className="nav-link" to="/admin">
                  <div className="sb-nav-link-icon">
                    <i className="fas fa-tachometer-alt"></i>
                  </div>
                  Dashboard
                </Link>
                <Link className="nav-link" to="/admin/products">
                  <div className="sb-nav-link-icon">
                    <i className="fas fa-box"></i>
                  </div>
                  Products
                </Link>
                <Link className="nav-link" to="/admin/reviews">
                  <div className="sb-nav-link-icon">
                    <i className="fas fa-star"></i>
                  </div>
                  Reviews
                </Link>
                <Link className="nav-link" to="/admin/orders">
                  <div className="sb-nav-link-icon">
                    <i className="fas fa-shopping-cart"></i>
                  </div>
                  Orders
                </Link>
                <Link className="nav-link" to="/admin/categories">
                  <div className="sb-nav-link-icon">
                    <i className="fas fa-tags"></i>
                  </div>
                  Categories
                </Link>
                <Link className="nav-link" to="/admin/users">
                  <div className="sb-nav-link-icon">
                    <i className="fas fa-user"></i>
                  </div>
                  Users
                </Link>
                <Link className="nav-link" to="/admin/offers">
                  <div className="sb-nav-link-icon">
                    <i className="fas fa-gift"></i>
                  </div>
                  Offers
                </Link>
                <Link className="nav-link" to="/admin/banners">
                  <div className="sb-nav-link-icon">
                    <i className="fas fa-image"></i>
                  </div>
                  Banners
                </Link>
                <Link className="nav-link" to="/admin/responses">
                  <div className="sb-nav-link-icon">
                    <i className="fas fa-envelope"></i>
                  </div>
                  Response Management
                </Link>
                <Link className="nav-link" to="/admin/site-settings">
                  <div className="sb-nav-link-icon">
                    <i className="fas fa-gear"></i>
                  </div>
                  Site Settings
                </Link>
              </div>
            </div>
          </nav>
        </div>
  );
};

export default Sidebar;
