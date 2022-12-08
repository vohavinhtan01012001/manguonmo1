var $ = document.querySelector.bind(document)
var $$ = document.querySelectorAll.bind(document)


const PLAYER_STORAGE_KEY = 'F8_PLAYER';
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');



const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem('PLAYER_STORAGE_KEY')) || {},
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem('PLAYER_STORAGE_KEY', JSON.stringify(this.config));
  },
  songs: [
    {
      name: "Độc thân không phải là ế",
      singer: 'Nguyễn Trung Đức',
      path: './assets/music/Doc-Than-Khong-Phai-La-E-Nguyen-Trung-Duc.mp3',
      Image: './assets/img/docthankhongphailae.png',
    },
    {
      name: "Hạnh phúc mới",
      singer: 'HariWon',
      path: './assets/music/Hanh-Phuc-Moi-Hari-Won-Pham-Quynh-Anh.mp3',
      Image: './assets/img/Hanhphucmoi.png',
    },
    {
      name: "Phố đã lên đèn",
      singer: 'Huyền Tâm Môn',
      path: './assets/music/PhoDaLenDenOrinnRemix-HuyenTamMon-7047712.mp3',
      Image: './assets/img/Phodalenden.png',
    },
    {
      name: "Răng khôn",
      singer: 'Phí Phương Anh',
      path: './assets/music/RangKhon-PhiPhuongAnhTheFaceRIN9-7006388.mp3',
      Image: './assets/img/Rangkhon.png',
    },
    {
      name: "Thức giấc",
      singer: 'Da LAB',
      path: './assets/music/Thuc-Giac-Da-LAB.mp3',
      Image: './assets/img/Thucgiac.png',
    },
    {
      name: "Yêu nhau nhé bạn thân",
      singer: 'Phạm Đình Thái Ngân',
      path: './assets/music/YeuNhauNheBanThanRemix-PhamDinhThaiNganHinoToChauRap-7211108.mp3',
      Image: './assets/img/Yeunhaunhebanthan.png',
    },
  ],
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
          <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
            <div class="thumb"
                style="background-image: url('${song.Image}');"></div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
          <div class="option">
            <i class="fas fa-ellipsis-h"></i>
          </div>
        </div>
      `
    })
    playlist.innerHTML = htmls.join('')
  },
  //tạo một currentSong 
  defineProperties: function () {
    Object.defineProperty(this, 'currentSong', {
      get: function () {
        return this.songs[this.currentIndex];
      }
    });
  },

  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    //xử lí CD quay / dừng
    const cdThumbAnimate = cdThumb.animate([
      { transform: 'rotate(360deg)' }
    ],
      {
        duration: 10000, // 10 giây 1 vòng
        iterations: 'Infinity' // quay vô hạn
      })
    cdThumbAnimate.pause();

    //xử lí phóng to/ thu nhỏ
    document.onscroll = function () {
      const scrollTop = document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;
      cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
      cd.style.opacity = (newCdWidth / cdWidth);
    };
    // Xử lí khi click play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    }

    //Khi song được play
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
      _this.render();
    }

    //Khi song bị pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
      _this.render();
    }

    //Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
        progress.value = progressPercent;
      }
    }

    //Xử lí khi tua song
    progress.onchange = function () {
      const seekTime = audio.duration / 100 * progress.value;
      audio.currentTime = seekTime;
    }

    //xử lí next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      }
      else {
        _this.nextSong();
      }
      audio.play();
      _this.scrollToActiveSong();
    }

    //Xử lí prev song
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      }
      else {
        _this.prevSong();
      }
      audio.play();
      _this.scrollToActiveSong();
    }

    //Xử lí bật / tắt random song
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    //Xử lí lặp lại một song 
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };


    //xử lí next song khi audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      }
      else {
        nextBtn.click();
      }
    };

    // lắng nghe hành vi click khi chọn playlist  ///closest trả về tổ tiên của nó được chỉ định trong ()
    playlist.onclick = function (e) {
      const songNode = e.target.closest('.song:not(.active)');
      if (songNode || e.target.closest('.option')) {
        //xử lí click vào song
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          audio.play();
          _this.render();
        }
        if (e.target.closest('.option')) {

        }
      }
    };
  },

  scrollToActiveSong: function () {
    setTimeout(() => {
      $('.song.active').scrollIntoView({
        behavior: 'smooth',
        block: "center",
      }, 200)
    })
  },

  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.Image}')`;
    audio.src = this.currentSong.path;
  },

  loadConfig: function () {
    //TH 1
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;

    /*  Object.assign(this,this.config); //TH 2 */
  },

  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },

  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex <= 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex == this.currentIndex);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  start: function () {
    //Gán cấu hình từ config vào ứng dụng
    this.loadConfig();
    //Định nghĩa các thuộc tính cho oject
    this.defineProperties();

    //Lắng nghe / Xử lý các sự kiện(DOM event)
    this.handleEvents();

    //Tải thông tin bài hát đầu tiên vào UI khi vào ứng dụng
    this.loadCurrentSong();


    //Render playlist
    this.render();

    //Hiển thị trạng thái ban đầu của button repeat & random
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
  }
}
app.start();