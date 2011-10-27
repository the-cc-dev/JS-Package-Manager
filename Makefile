
JS_MIN = uglifyjs
JS_MIN_FLAGS = --unsafe --no-copyright

SRC_DIR = .
BUILD_DIR = build
PACKAGES_DIR = packages
PACKAGES = ${PACKAGES_DIR}/color.js\
	${PACKAGES_DIR}/cookies.js\
	${PACKAGES_DIR}/css.js\
	${PACKAGES_DIR}/cssColor.js\
	${PACKAGES_DIR}/datetime.js\
	${PACKAGES_DIR}/dom.js\
	${PACKAGES_DIR}/download.js\
	${PACKAGES_DIR}/dragdrop.js\
	${PACKAGES_DIR}/events.js\
	${PACKAGES_DIR}/fonts.js\
	${PACKAGES_DIR}/fx.js\
	${PACKAGES_DIR}/json.js\
	${PACKAGES_DIR}/rand.js\
	${PACKAGES_DIR}/spin.js\
	${PACKAGES_DIR}/str.js\
	${PACKAGES_DIR}/utils.js\
	${PACKAGES_DIR}/validation.js\
	${PACKAGES_DIR}/xhr.js

JS_FILES = core.js\
	${PACKAGES}
	
dist: ${PACKAGES_DIR}
	for file in ${JS_FILES} ; do \
		${JS_MIN} ${JS_MIN_FLAGS} ${SRC_DIR}/$$file > ${BUILD_DIR}/$$file ; \
	done
	tar -cvzf ${BUILD_DIR}.tar.gz ${BUILD_DIR}
	
${PACKAGES_DIR}: ${BUILD_DIR}
	mkdir -p ${BUILD_DIR}/${PACKAGES_DIR}

${BUILD_DIR}:
	mkdir -p ${BUILD_DIR}

clean:
	rm -rf ${BUILD_DIR}
	rm -f ${BUILD_DIR}.tar.gz

.PHONY: clean

