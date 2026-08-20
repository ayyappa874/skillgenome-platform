const fs = require('fs');

const fixFile = (path) => {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace("      </View>\r\n    </Modal>", "      </View>\n      </View>\n    </Modal>");
  content = content.replace("      </View>\n    </Modal>", "      </View>\n      </View>\n    </Modal>");
  content = content.replace("        </View>\r\n    </Modal>", "        </View>\n      </View>\n    </Modal>");
  content = content.replace("        </View>\n    </Modal>", "        </View>\n      </View>\n    </Modal>");
  fs.writeFileSync(path, content, 'utf8');
};

fixFile('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/components/MentorLiveSession.js');
fixFile('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/components/StudentLiveSession.js');
console.log("Forced fix JSX closing tags!");
