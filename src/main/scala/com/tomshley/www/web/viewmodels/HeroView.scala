package com.tomshley.www.web.viewmodels

import com.tomshley.hexagonal.lib.mvp.ViewModel

case class HeroView(name: String,
                    noContent: Boolean = false,
                    showImage: Boolean = false)
    extends ViewModel
