---
# An instance of the Contact widget.
widget: contact

# This file represents a page section.
headless: true

# Order that this section appears on the page.
weight: 130

title: Contact
subtitle:

content:
  # Automatically link email and phone or display as text?
  autolink: true

  # Email form provider
  form:
    provider: netlify
    formspree:
      id:
    netlify:
      # Enable CAPTCHA challenge to reduce spam?
      captcha: true

  # Contact details (edit or remove options as required)
  email: philip.solimine@ubc.ca
  phone:
  address:
    street: 6000 Iona Drive
    city: Vancouver
    region: BC
    postcode:
    country: Canada
    country_code: CA
  coordinates:
    latitude:
    longitude:
  directions:
  office_hours:
    - 'Office Hours:'
    - 'Tuesday 10:30-11:30am or by appointment'

design:
  columns: '2'
---
