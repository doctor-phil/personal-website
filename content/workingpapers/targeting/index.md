---
title: 'Coarse targeting in social networks'

# Authors
# If you created a profile for a user (e.g. the default `admin` user), write the username (folder name) here
# and it will be replaced with their full name and linked to their profile.
authors:

# Author notes (optional)
author_notes: ''

date: '2026-01-01'
doi: ''

# Schedule page publish date (NOT publication's date).
publishDate: ''

# Publication type.
# Legend: 0 = Uncategorized; 1 = Conference paper; 2 = Journal article;
# 3 = Preprint / Working Paper; 4 = Report; 5 = Book; 6 = Book section;
# 7 = Thesis; 8 = Patent
publication_types: ['3']

# Publication name and optional abbreviated publication name.
publication: 'Working paper'
publication_short: ''

abstract:
  (with [Wei Li](https://economics.ubc.ca/profile/wei-li/))</br>
   <details><summary><b>Show/Hide Abstract</b></summary>
      <ul>
         We study optimal intervention in an opinion network when a decision-maker can adjust the intensity of a common message over time but must commit ex ante to a fixed exposure rule across agents. Because the same rule governs every future message, its value depends not only on current opinions but also on how disagreement propagates and which opinion differences remain costly over time. We characterize optimal targeting through a dynamic fixed-point condition: the optimal rule must be consistent with the disagreement path it induces. The main finding is that optimal targeting is governed by persistent disagreement rather than by centrality or contemporaneous extremism. In symmetric networks, uniform targeting is optimal only when initial opinions are uniform; otherwise, exposure tilts toward active disagreement dimensions, with larger tilts toward slower-decaying dimensions. In asymmetric networks, authority-based targeting is optimal when the network compresses opinions into a single propagated aggregate, but perturbations that create additional active disagreement make optimal targeting state-dependent. Centrality-based rules are therefore special cases, arising when disagreement is transient or effectively one-dimensional. We characterize the welfare cost of the coarse restriction. The payoff loss from fixing the exposure rule is determined by where the coarse rule poorly approximates fully flexible targeting and whether those errors occur along persistent dimensions of disagreement. Coarse targeting nearly matches fully flexible targeting when persistent disagreement is low-dimensional, and is costly when persistent disagreement is multidimensional or repeatedly reintroduced by noise or misinformation. Applying the model to U.S. Facebook friendship networks and state-level climate opinions, we find that optimal coarse targeting differs systematically from centrality- and opinion-based heuristics while nearly matching the value of fully flexible targeting.
      </ul>
  </details>

# Summary. An optional shortened abstract.
summary: ''

tags: ['Networks', 'Network corruption', 'Computational economics', 'Microeconomic theory']

# Display this page in the Featured widget?
featured: true

# Custom links (uncomment lines below)
links:
  - name: 'Extended abstract'
    url: 'https://www.psolimine.net/workingpapers/targeting/targeting_extended_abstract.pdf'
#   url: 'https://arxiv.org/abs/2109.14204'

url_pdf: ''
url_code: ''
url_dataset: ''
url_poster: ''
url_project: ''
url_slides: ''
url_source: ''
url_video: ''

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder.
image:
  caption: ''
  focal_point: ''
  preview_only: false

# Associated Projects (optional).
#   Associate this publication with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `internal-project` references `content/project/internal-project/index.md`.
#   Otherwise, set `projects: []`.
projects: []

# Slides (optional).
#   Associate this publication with Markdown slides.
#   Simply enter your slide deck's filename without extension.
#   E.g. `slides: "example"` references `content/slides/example/index.md`.
#   Otherwise, set `slides: ""`.
slides: ""
---
(with [Wei Li](https://economics.ubc.ca/profile/wei-li/))
<li><b>Abstract:</b></li>
<ul>
   We study how a planner can optimally counter misinformation in a social network under *coarse targeting*—she broadcasts the same message to all agents, but chooses their exposure levels. Before messaging begins, the planner chooses a vector of target weights that determine how much each agent is exposed to her message, in order to maximize total discounted utility. Optimal targeting depends jointly on the network structure and the distribution of initial opinions. Counterintuitively, agents with extreme views may sometimes receive *less* exposure.  In stylized opinion-leader networks, optimal  weights align with authority centrality. But centrality alone is also not sufficient; in symmetric networks, targeting is uniform only when initial opinions are in consensus.  More generally, optimal weights reflect persistent local opinion dispersion among subsets of agents, which slows opinion convergence. We illustrate the model using U.S. Facebook friendship data and climate change opinions. In this example, the planner over-targets Texas and under-targets California despite their similar centrality. This underscores how local disagreements shape optimal targeting. 
</ul>