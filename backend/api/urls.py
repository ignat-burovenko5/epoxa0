from django.urls import path

from api import views

urlpatterns = [
    path("blog", views.blog_list),
    path("blog/auth/login", views.blog_auth_login),
    path("blog/auth/logout", views.blog_auth_logout),
    path("blog/auth/session", views.blog_auth_session),
    path("blog/admin/posts", views.blog_admin_posts),
    path("blog/admin/posts/<str:uid>", views.blog_admin_post_detail),
    path("blog/admin/products", views.blog_admin_products),
    path("blog/admin/products/<str:slug>", views.blog_admin_product_detail),
    path("blog/admin/products/<str:slug>/status", views.blog_admin_product_status),
    path("blog/admin/products-seed", views.blog_admin_products_seed),
    path("blog/admin/settings", views.blog_admin_settings),
    path("blog/admin/overview", views.blog_admin_overview),
    path("blog/admin/upload", views.blog_admin_upload),
    path("blog/internal/store", views.blog_internal_store),
    path("blog/internal/posts/<str:uid>", views.blog_internal_post),
    path("blog/internal/published/<str:uid>", views.blog_internal_published_post),
    path("blog/internal/published-uids", views.blog_internal_published_uids),
    path("analytics/event", views.analytics_event),
    path("analytics/internal/store", views.analytics_internal_store),
    path("shop/lead", views.shop_lead),
    path("shop/internal/leads", views.shop_internal_leads),
    path("shop/internal/store", views.shop_internal_leads_store),
]
