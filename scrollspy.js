/**
 * Created by pyh on 2016/12/16.
 */
;(function(win,doc,$){
    //滚动监听的构造函数
   function ScrollSpy(options){
       this._init(options)
   }

    $.extend(ScrollSpy.prototype,{
        //初始化函数
        _init:function(options){
           var self = this;
           self.options = {
               scrollDir:"y",//滚动的方向
               contentSelector:"",//内容选择器
               tabItemSelector:".tab-item",//tab标签
               tabItemActiveClass:"active",//tab选中标签
               contentItemSelector:".content-item",//每篇内容选择器
               barSelector:"",//滚动条选择器
               sliderSelector:"",//滚动滑块选择器
               wheelStep:10//滚轮步长
           };
           $.extend(true,self.options,options||{});
           self._initDom();
           return self;
        },
        //初始化DOM结构
        _initDom:function(){
            var opts = this.options;
            this.$content = $(opts.contentSelector);
            this.$tabItem = $(opts.tabItemSelector);
            this.$contentItem = $(opts.contentItemSelector);
            this.$slider = $(opts.sliderSelector);
            this.$bar = opts.barSelector ? $(opts.barSelector):self.$slider.parent();
            this.$doc = $(doc);
            this._initSliderDragEvent()
                ._sliderByContent()
                ._bindMouseWheel()
                ._initTabEvent();
        },
        //初始化滑块儿滑动事件
        _initSliderDragEvent:function(){
            var self = this;
            var slider = this.$slider;
            var sliderEle = slider[0];
            if(sliderEle){
                var doc = this.$doc,
                    dragStartPagePosition,
                    dragStartScrollPosition,
                    dragConBarRate;
                function mousemoveHandler(e){
                    e.preventDefault();
                    console.log("mousemove");
                    if(dragStartPagePosition==null){
                        return;
                    }
                    self.scrollToPosition(dragStartPagePosition+
                    (e.pageY-dragStartPagePosition)*dragConBarRate);
                }
                slider.on("mousedown",function(e){
                    e.preventDefault();
                    dragStartPagePosition = e.pageY;
                    dragStartScrollPosition = self.$content[0].scrollTop;
                    dragConBarRate = self.getMaxScrollPosition()/self.getMaxSliderPosition();
                    console.log("mousedown");
                    doc.on("mousemove.scroll",mousemoveHandler)
                        .on("mouseup.scroll",function(){
                          console.log("mouseup")
                        doc.off(".scroll")
                    })
                })
            }
            return self;
        },
        //滑块儿随着内容而滑动
        _sliderByContent:function(){
            var self = this;
            self.$content.on("scroll",function(){
                var slideEle = self.$slider && self.$slider[0];
                if(slideEle){
                    slideEle.style.top = self.getSliderCurrentPosition() + "px";
                }
            })
            return self;
        },
        //滚轮监听事件
        _bindMouseWheel:function(){
            var self = this;
            self.$content.on("mousewheel DOMMouseScroll",function(e){
                e.preventDefault();
                var oEv = e.originalEvent,
                wheelRange = oEv.wheelDelta ? -oEv.wheelDelta/120
                                            : (oEv.detail || 0) /3;
                self.scrollToPosition(self.$content[0].scrollTop+
                wheelRange*self.options.wheelStep)
            });
            return self;
        },
        //初始化标签页
        _initTabEvent:function(){
            var self = this;
            self.$tabItem.on("click",function(e){
                e.preventDefault();
                var index = $(this).index();
                self.changeSelectTab(index);
                self.scrollToPosition(self.$content[0].scrollTop+
                self.getContentItemPosition(index))
            })
            return self;
        },
        //改变标签页的选中状态
        changeSelectTab:function(index){
            var self = this,
                active = self.options.tabItemActiveClass;
            return self.$tabItem.eq(index).addClass(active).siblings().removeClass(active);
        },
        //过得每个篇幅相对父元素的偏移量
        getAllContentItemPosition:function(){
            var self = this,
                allPositionArr = [];
            for(var i = 0;i<self.$contentItem.length;i++){
                allPositionArr.push(self.$content[0].scrollTop+
                self.getContentItemPosition(i))
            }
            return allPositionArr;
        },
        //获得篇幅内容相对父元素的偏移量
        getContentItemPosition:function(index){
            return this.$contentItem.eq(index).position().top;
        },
        //获得滑块儿的当前位置
        getSliderCurrentPosition:function(){
            var self = this,
            maxSliderPosition = self.getMaxSliderPosition();
            return Math.min(maxSliderPosition,
                            maxSliderPosition*self.$content[0].scrollTop/
                           self.getMaxScrollPosition());
        },
        //获得内容最大的滑动距离
        getMaxScrollPosition:function(){
            var self = this;
            return Math.max(self.$content.height(),self.$content[0].scrollHeight)
            -self.$content.height();
        },
        //获得滑块儿最大滑动距离
        getMaxSliderPosition:function(){
            var self = this;
            return self.$bar.height()-self.$slider.height();
        },
        //内容区超出上边界的高度
        scrollToPosition:function(positionVal){
            var self = this;
            var posArr = self.getAllContentItemPosition();
            function getIndex(positionVal){
                for(var i = posArr.length-1;i>=0;i--){
                    if(positionVal>=posArr[i]){
                        //console.log(positionVal)
                        //console.log(posArr[i])
                        //console.log(i)
                        return i;
                    }else{
                        continue;
                    }
                }
            }
            //文章篇幅与标签数目相同
            if(posArr.length==self.$tabItem.length){
                self.changeSelectTab(getIndex(positionVal));
            }
            self.$content.scrollTop(positionVal);
        }
    })
    win.ScrollSpy = ScrollSpy;
})(window,document,jQuery);